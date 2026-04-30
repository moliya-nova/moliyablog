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
    public Flux<ServerSentEvent<String>> streamChat(@RequestBody Map<String, String> request) {
        // 1. 检查 AI 服务是否启用
        if (!statusService.isEnabled()) {
            String errJson = "{\"code\":503,\"msg\":\"error\",\"answer\":\"AI 服务已暂时关闭\"}";
            return Flux.just(ServerSentEvent.builder(errJson).build());
        }

        // 2. 尝试获取信号量许可（非阻塞）
        if (!concurrencyService.tryAcquire()) {
            String errJson = "{\"code\":503,\"msg\":\"error\",\"answer\":\"AI 服务繁忙，请稍后重试\"}";
            return Flux.just(ServerSentEvent.builder(errJson).build());
        }

        // 3. 记录请求统计
        statusService.incrementRequests();
        statusService.incrementConnections();

        String message = request.get("message");
        String threadId = request.getOrDefault("thread_id", "default");

        // 4. 参数校验
        if (message == null || message.isBlank()) {
            concurrencyService.release();
            statusService.decrementConnections();
            String errorJson = "{\"code\":400,\"msg\":\"error\",\"answer\":\"消息不能为空\"}";
            return Flux.just(ServerSentEvent.builder(errorJson).build());
        }

        // 5. 代理到 FastAPI 流式接口
        return webClient.post()
                .uri("/chat/stream")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(Map.of("message", message, "thread_id", threadId))
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
                    String errJson = "{\"code\":502,\"msg\":\"error\",\"answer\":\"FastAPI流式服务异常：" + e.getMessage() + "\"}";
                    return Flux.just(ServerSentEvent.builder(errJson).build());
                });
    }

    // ===================== 清除会话记忆 =====================
    @DeleteMapping("/chat/memory/{threadId}")
    public Map<String, Object> deleteMemory(@PathVariable String threadId) {
        return webClient.delete()
                .uri("/chat/memory/{threadId}", threadId)
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
