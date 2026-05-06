package com.bloger.ai.controller;

import com.bloger.ai.dto.AiConfigDTO;
import com.bloger.ai.dto.AiStatusDTO;
import com.bloger.ai.dto.AiStatsDTO;
import com.bloger.ai.service.AiConfigService;
import com.bloger.ai.service.AiConcurrencyService;
import com.bloger.ai.service.AiStatusService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * AI 智能体管理控制器
 * 提供 AI 服务的状态管理、并发控制、配置管理等功能
 */
@Slf4j
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
public class AiManageController {

    private final AiStatusService statusService;
    private final AiConcurrencyService concurrencyService;
    private final AiConfigService configService;

    // ===================== 状态管理 =====================

    /**
     * 获取 AI 服务状态
     */
    @GetMapping("/status")
    public AiStatusDTO getStatus() {
        AiStatusDTO dto = new AiStatusDTO();
        dto.setEnabled(statusService.isEnabled());
        dto.setMaxConcurrency(concurrencyService.getMaxConcurrency());
        dto.setActiveConnections((int) statusService.getActiveConnections());
        dto.setTotalRequests(statusService.getTotalRequests());
        dto.setMessage(statusService.isEnabled() ? "AI 服务运行中" : "AI 服务已关闭");
        return dto;
    }

    /**
     * 切换 AI 服务启用/禁用状态
     * @param enabled 可选参数，不传则切换状态
     */
    @PutMapping("/status")
    public AiStatusDTO toggleStatus(@RequestParam(required = false) Boolean enabled) {
        if (enabled != null) {
            statusService.setEnabled(enabled);
        } else {
            statusService.toggle();
        }
        return getStatus();
    }

    // ===================== 并发控制 =====================

    /**
     * 获取并发设置
     */
    @GetMapping("/concurrency")
    public Map<String, Object> getConcurrency() {
        return Map.of(
                "maxConcurrency", concurrencyService.getMaxConcurrency(),
                "availablePermits", concurrencyService.availablePermits()
        );
    }

    /**
     * 设置最大并发数
     */
    @PutMapping("/concurrency")
    public Map<String, Object> setConcurrency(@RequestBody Map<String, Integer> body) {
        int max = body.getOrDefault("maxConcurrency", 5);
        concurrencyService.setMaxConcurrency(max);
        return getConcurrency();
    }

    // ===================== 配置管理（代理到 FastAPI）=====================

    /**
     * 获取当前 AI 配置
     */
    @GetMapping("/config")
    public ResponseEntity<Map<String, Object>> getConfig() {
        try {
            Map<String, Object> result = configService.getConfig();
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("获取 AI 配置失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }

    /**
     * 更新 AI 配置（会触发热重载）
     */
    @PutMapping("/config")
    public ResponseEntity<Map<String, Object>> updateConfig(@RequestBody AiConfigDTO dto) {
        try {
            Map<String, Object> result = configService.updateConfig(dto);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("更新 AI 配置失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }

    // ===================== 统计信息 =====================

    /**
     * 获取 AI 服务统计信息
     */
    @GetMapping("/stats")
    public AiStatsDTO getStats() {
        AiStatsDTO dto = new AiStatsDTO();
        dto.setTotalRequests(statusService.getTotalRequests());
        dto.setActiveConnections((int) statusService.getActiveConnections());
        dto.setMaxConcurrency(concurrencyService.getMaxConcurrency());
        dto.setEnabled(statusService.isEnabled());
        // 活跃线程信息从 FastAPI 获取
        try {
            Map<String, Object> threadsData = configService.getActiveThreads();
            if (threadsData != null && threadsData.containsKey("data")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> threads = (List<Map<String, Object>>) threadsData.get("data");
                dto.setActiveThreads(threads);
            }
        } catch (Exception e) {
            log.warn("获取活跃线程失败: {}", e.getMessage());
            dto.setActiveThreads(List.of());
        }
        return dto;
    }

    // ===================== 会话记忆管理（代理到 FastAPI）=====================

    /**
     * 获取活跃会话线程列表
     */
    @GetMapping("/threads")
    public ResponseEntity<Map<String, Object>> getActiveThreads() {
        try {
            Map<String, Object> result = configService.getActiveThreads();
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("获取活跃线程失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }

    /**
     * 清除所有会话记忆
     */
    @DeleteMapping("/memory")
    public ResponseEntity<Map<String, Object>> clearAllMemory() {
        try {
            Map<String, Object> result = configService.clearAllMemory();
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("清除会话记忆失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }

    /**
     * 删除单条会话（管理员直接传完整 thread_id）
     */
    @DeleteMapping("/thread/{threadId}")
    public ResponseEntity<Map<String, Object>> deleteThread(@PathVariable String threadId) {
        try {
            Map<String, Object> result = configService.deleteThread(threadId);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("删除会话失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }
}
