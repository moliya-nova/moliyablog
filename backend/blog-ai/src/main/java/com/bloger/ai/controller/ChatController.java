package com.bloger.ai.controller;

import com.bloger.ai.service.AiConcurrencyService;
import com.bloger.ai.service.AiStatusService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.SneakyThrows;
import org.springframework.http.*;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;

import java.util.Base64;
import java.util.Map;

/**
 * AI 聊天代理控制器
 * 将前端的聊天请求代理到 FastAPI 流式接口，支持并发控制和启用/禁用
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class ChatController {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final AiStatusService statusService;
    private final AiConcurrencyService concurrencyService;

    /**
     * SSE 流式聊天接口
     * 1. 检查 AI 是否启用
     * 2. 通过 Semaphore 控制并发
     * 3. 代理请求到 FastAPI 并透传 SSE 流
     */
    @PostMapping(value = "/chat", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<String>> streamChat(@RequestBody Map<String, String> request,
                                                    @RequestHeader(value = "Authorization", required = false) String authorization) {
        // 1. 检查 AI 服务是否启用
        if (!statusService.isEnabled()) {
            String errJson = "{\"code\":503,\"msg\":\"AI 服务已暂时关闭\",\"data\":\"\"}";
            return Flux.just(ServerSentEvent.builder(errJson).build());
        }

        // 2. 登录校验
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            String errJson = "{\"code\":401,\"msg\":\"抱歉，你还没登陆呢，马小凯不认识你，不能为你解答疑惑\",\"data\":\"\"}";
            return Flux.just(ServerSentEvent.builder(errJson).build());
        }
        String username;
        try {
            username = parseUsernameFromToken(authorization.substring(7));
        } catch (Exception ignored) {
            username = null;
        }
        if (username == null) {
            String errJson = "{\"code\":401,\"msg\":\"抱歉，你还没登陆呢，马小凯不认识你，不能为你解答疑惑\",\"data\":\"\"}";
            return Flux.just(ServerSentEvent.builder(errJson).build());
        }

        // 3. 尝试获取信号量许可（非阻塞）
        if (!concurrencyService.tryAcquire()) {
            String errJson = "{\"code\":503,\"msg\":\"AI 服务繁忙，请稍后重试\",\"data\":\"\"}";
            return Flux.just(ServerSentEvent.builder(errJson).build());
        }

        // 4. 记录请求统计
        statusService.incrementRequests();
        statusService.incrementConnections();

        String message = request.get("message");
        String clientThreadId = request.getOrDefault("thread_id", "default");
        String userId = request.get("user_id");

        // 5. 参数校验
        if (message == null || message.isBlank()) {
            concurrencyService.release();
            statusService.decrementConnections();
            String errorJson = "{\"code\":400,\"msg\":\"消息不能为空\",\"data\":\"\"}";
            return Flux.just(ServerSentEvent.builder(errorJson).build());
        }

        // 6. 基于用户身份构建 thread_id
        String threadId = buildThreadId(clientThreadId, userId, username);

        // 7. 代理到 FastAPI 流式接口（传递 username 用于管理端展示）
        
        return webClient.post()
                .uri("/chat/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("message", message, "thread_id", threadId, "username", username))
                .retrieve()
                .bodyToFlux(ServerSentEvent.class)
                .map(this::toJson)
                .map(json -> ServerSentEvent.builder(json).build())
                // 无论成功、失败还是取消，都释放信号量和减少连接计数
                .doFinally(signal -> {
                    concurrencyService.release();
                    statusService.decrementConnections();
                })
                .onErrorResume(e -> {
                    String errJson = "{\"code\":502,\"msg\":\"FastAPI流式服务异常：" + e.getMessage() + "\",\"data\":\"\"}";
                    return Flux.just(ServerSentEvent.builder(errJson).build());
                });
    }

    /**
     * 基于用户身份构建 thread_id
     * 已登录用户：user_{userId}_{clientThreadId}（绑定到用户账户）
     */
    private String buildThreadId(String clientThreadId, String userId, String username) {
        // 优先使用前端传来的 user_id
        if (userId != null && !userId.isBlank()) {
            return "user_" + userId + "_" + clientThreadId;
        }
        // 回退：使用从 JWT 解析的用户名
        return "user_" + username + "_" + clientThreadId;
    }

    /**
     * 从 JWT token 中解析用户名（Base64 解码 payload 部分）
     */
    private String parseUsernameFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String payload = new String(Base64.getDecoder().decode(parts[1]));
            // 简单提取 "sub" 字段值
            int subIndex = payload.indexOf("\"sub\"");
            if (subIndex == -1) return null;
            int start = payload.indexOf("\"", subIndex + 5) + 1;
            int end = payload.indexOf("\"", start);
            if (start <= 0 || end <= start) return null;
            return payload.substring(start, end);
        } catch (Exception e) {
            return null;
        }
    }

    /**
     * 从 JWT token 中解析用户ID（Base64 解码 payload 部分）
     */
    private String parseUserIdFromToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return null;
            String payload = new String(Base64.getDecoder().decode(parts[1]));
            // 尝试提取 "userId" 或 "id" 字段值
            for (String field : new String[]{"userId", "id"}) {
                int idx = payload.indexOf("\"" + field + "\"");
                if (idx == -1) continue;
                int colon = payload.indexOf(":", idx + field.length() + 2);
                if (colon == -1) continue;
                // 跳过空白
                int valStart = colon + 1;
                while (valStart < payload.length() && payload.charAt(valStart) == ' ') valStart++;
                int valEnd;
                if (payload.charAt(valStart) == '"') {
                    valStart++;
                    valEnd = payload.indexOf("\"", valStart);
                } else {
                    valEnd = valStart;
                    while (valEnd < payload.length() && Character.isDigit(payload.charAt(valEnd))) valEnd++;
                }
                if (valStart < valEnd) return payload.substring(valStart, valEnd);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    // ===================== 清除会话记忆 =====================
    @DeleteMapping("/chat/memory/{threadId}")
    public Map<String, Object> deleteMemory(@PathVariable String threadId,
                                            @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Map.of("code", 401, "msg", "未登录", "data", "");
        }
        String token = authorization.substring(7);
        String username = parseUsernameFromToken(token);
        String userId = parseUserIdFromToken(token);
        if (username == null) {
            return Map.of("code", 401, "msg", "未登录", "data", "");
        }
        // 与 buildThreadId 保持一致：优先用 userId
        String fullThreadId;
        if (userId != null && !userId.isBlank()) {
            fullThreadId = "user_" + userId + "_" + threadId;
        } else {
            fullThreadId = "user_" + username + "_" + threadId;
        }
        return webClient.delete()
                .uri("/chat/memory/{threadId}", fullThreadId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    // ===================== 获取会话历史消息 =====================
    @GetMapping("/chat/history/{threadId}")
    public Map<String, Object> getMessageHistory(@PathVariable String threadId,
                                                  @RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return Map.of("code", 401, "msg", "未登录", "data", "");
        }
        String token = authorization.substring(7);
        String username = parseUsernameFromToken(token);
        String userId = parseUserIdFromToken(token);
        if (username == null) {
            return Map.of("code", 401, "msg", "未登录", "data", "");
        }
        String fullThreadId;
        if (userId != null && !userId.isBlank()) {
            fullThreadId = "user_" + userId + "_" + threadId;
        } else {
            fullThreadId = "user_" + username + "_" + threadId;
        }
        return webClient.get()
                .uri("/chat/history/{threadId}", fullThreadId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    @SneakyThrows
    private String toJson(ServerSentEvent<Object> sse) {
        Object data = sse.data();
        if (data instanceof String s) {
            return s;
        }
        return objectMapper.writeValueAsString(data);
    }
}
