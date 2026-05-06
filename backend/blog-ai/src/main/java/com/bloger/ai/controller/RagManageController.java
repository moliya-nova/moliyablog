package com.bloger.ai.controller;

import com.bloger.ai.service.RagIndexService;
import com.bloger.backend.entity.Article;
import com.bloger.backend.service.ArticleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/ai/rag")
@RequiredArgsConstructor
public class RagManageController {

    private final RagIndexService ragIndexService;
    private final ArticleService articleService;

    /**
     * 索引单篇文章（前端在文章发布/修改时调用）。
     * blog-ai 转发到 FastAPI 的 /rag/index 端点。
     */
    @PostMapping("/index")
    public ResponseEntity<Map<String, Object>> indexArticle(@RequestBody Map<String, Object> body) {
        try {
            Long articleId = Long.valueOf(body.get("article_id").toString());
            String title = body.getOrDefault("title", "").toString();
            String content = body.getOrDefault("content", "").toString();

            Map<String, Object> result = ragIndexService.indexArticle(articleId, title, content);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("RAG 索引转发失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }

    /**
     * 删除文章索引（前端在文章删除时调用）。
     * blog-ai 转发到 FastAPI 的 /rag/index/{id} 端点。
     */
    @DeleteMapping("/index/{articleId}")
    public ResponseEntity<Map<String, Object>> deleteArticleIndex(@PathVariable Long articleId) {
        try {
            Map<String, Object> result = ragIndexService.deleteArticleIndex(articleId);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("RAG 删除转发失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }

    /**
     * 全量重建 RAG 索引。
     * 直接从 ArticleService 获取文章，转换后推送给 FastAPI。
     */
    @PostMapping("/reindex")
    public ResponseEntity<Map<String, Object>> reindexAll() {
        try {
            List<Article> articles = articleService.listAll();
            List<Map<String, Object>> articleMaps = new ArrayList<>();
            for (Article article : articles) {
                if (article.getContent() == null || article.getContent().isEmpty()) {
                    continue;
                }
                Map<String, Object> map = new HashMap<>();
                map.put("article_id", article.getId());
                map.put("title", article.getTitle() != null ? article.getTitle() : "");
                map.put("url", "/article/" + article.getId());
                map.put("content", article.getContent());
                articleMaps.add(map);
            }

            log.info("全量重建 RAG 索引，共 {} 篇文章", articleMaps.size());
            Map<String, Object> result = ragIndexService.reindexAll(articleMaps);
            if (result == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of("code", 502, "msg", "FastAPI 服务无响应", "data", ""));
            }
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("RAG 全量重建失败: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of("code", 502, "msg", "FastAPI 服务异常: " + e.getMessage(), "data", ""));
        }
    }
}
