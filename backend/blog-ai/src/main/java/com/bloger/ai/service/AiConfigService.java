package com.bloger.ai.service;

import com.bloger.ai.dto.AiConfigDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.Map;

/**
 * AI 配置代理服务
 * 通过 WebClient 将配置请求转发给 FastAPI 服务
 */
@Service
@RequiredArgsConstructor
public class AiConfigService {

    private final WebClient webClient;

    /**
     * 从 FastAPI 获取当前 AI 配置
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getConfig() {
        return webClient.get()
                .uri("/config")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    /**
     * 更新 FastAPI 的 AI 配置（会触发热重载）
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> updateConfig(AiConfigDTO dto) {
        return webClient.put()
                .uri("/config")
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(dto)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    /**
     * 从 FastAPI 获取活跃会话线程列表
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getActiveThreads() {
        return webClient.get()
                .uri("/chat/threads")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    /**
     * 清除 FastAPI 中的所有会话记忆
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> clearAllMemory() {
        return webClient.delete()
                .uri("/chat/memory")
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }

    /**
     * 删除 FastAPI 中的单条会话
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteThread(String threadId) {
        return webClient.delete()
                .uri("/chat/thread/{threadId}", threadId)
                .retrieve()
                .bodyToMono(Map.class)
                .block();
    }
}
