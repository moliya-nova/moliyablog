package com.bloger.ai.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class RagIndexService {

    private final WebClient webClient;

    /**
     * 发送文章到 FastAPI 进行 RAG 索引。
     * 使用原始类型参数避免对 blog-core 的循环依赖。
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> indexArticle(Long articleId, String title, String content) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("article_id", articleId);
            body.put("title", title != null ? title : "");
            body.put("url", "/article/" + articleId);
            body.put("content", content != null ? content : "");

            Map<String, Object> result = webClient.post()
                    .uri("/rag/index")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            log.info("RAG 索引结果 article {}: {}", articleId, result);
            return result;
        } catch (WebClientResponseException e) {
            log.error("RAG 索引失败 article {}: {} - {}", articleId, e.getStatusCode(), e.getResponseBodyAsString());
            Map<String, Object> error = new HashMap<>();
            error.put("code", e.getStatusCode().value());
            error.put("msg", "Indexing failed: " + e.getMessage());
            error.put("data", null);
            return error;
        } catch (Exception e) {
            log.error("RAG 索引失败 article {}: {}", articleId, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("msg", "Indexing failed: " + e.getMessage());
            error.put("data", null);
            return error;
        }
    }

    /**
     * 删除文章的 RAG 索引。
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> deleteArticleIndex(Long articleId) {
        try {
            Map<String, Object> result = webClient.delete()
                    .uri("/rag/index/{id}", articleId)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            log.info("RAG 删除结果 article {}: {}", articleId, result);
            return result;
        } catch (WebClientResponseException e) {
            log.error("RAG 删除失败 article {}: {} - {}", articleId, e.getStatusCode(), e.getResponseBodyAsString());
            Map<String, Object> error = new HashMap<>();
            error.put("code", e.getStatusCode().value());
            error.put("msg", "Delete failed: " + e.getMessage());
            error.put("data", null);
            return error;
        } catch (Exception e) {
            log.error("RAG 删除失败 article {}: {}", articleId, e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("msg", "Delete failed: " + e.getMessage());
            error.put("data", null);
            return error;
        }
    }

    /**
     * 触发全量重建索引。
     * 由调用方（blog-core）将 Article 列表转为 Map 列表传入，避免循环依赖。
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> reindexAll(List<Map<String, Object>> articles) {
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("articles", articles);

            Map<String, Object> result = webClient.post()
                    .uri("/rag/index/all")
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();
            log.info("RAG 全量重建结果: {}", result);
            return result;
        } catch (WebClientResponseException e) {
            log.error("RAG 全量重建失败: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            Map<String, Object> error = new HashMap<>();
            error.put("code", e.getStatusCode().value());
            error.put("msg", "Reindex failed: " + e.getMessage());
            error.put("data", null);
            return error;
        } catch (Exception e) {
            log.error("RAG 全量重建失败: {}", e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("code", 500);
            error.put("msg", "Reindex failed: " + e.getMessage());
            error.put("data", null);
            return error;
        }
    }
}
