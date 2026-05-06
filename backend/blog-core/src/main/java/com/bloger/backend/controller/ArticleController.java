package com.bloger.backend.controller;

import com.bloger.backend.entity.Article;
import com.bloger.backend.service.ArticleService;
import com.bloger.backend.util.ImagePathValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/articles")
public class ArticleController {

    @Autowired
    private ArticleService articleService;

    @Autowired
    private ImagePathValidator imagePathValidator;

    @GetMapping
    public List<Article> list() {
        return articleService.list();
    }

    @GetMapping("/paged")
    public Map<String, Object> listPaged(@RequestParam(defaultValue = "1") int page, @RequestParam(defaultValue = "10") int size) {
        List<Article> content = articleService.listPage(page, size);
        long totalElements = articleService.countPublished();
        int totalPages = (int) Math.ceil((double) totalElements / size);
        Map<String, Object> result = new HashMap<>();
        result.put("content", content);
        result.put("totalElements", totalElements);
        result.put("totalPages", totalPages);
        result.put("currentPage", page);
        result.put("pageSize", size);
        return result;
    }

    @GetMapping("/all")
    public List<Article> listAll() {
        return articleService.listAll();
    }

    @GetMapping("/category/{id}")
    public List<Article> listByCategoryId(@PathVariable Long id) {
        return articleService.listByCategoryId(id);
    }

    @GetMapping("/tag/{id}")
    public List<Article> listByTagId(@PathVariable Long id) {
        return articleService.listByTagId(id);
    }

    @GetMapping("/{id}")
    public Article getById(@PathVariable Long id) {
        articleService.incrementViewCount(id);
        return articleService.getById(id);
    }

    @PostMapping
    public Article save(@RequestBody Article article) {
        imagePathValidator.validateImagePath(article.getImageUrl());
        articleService.save(article);
        return article;
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody Article article) {
        imagePathValidator.validateImagePath(article.getImageUrl());
        article.setId(id);
        articleService.update(article);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        articleService.delete(id);
    }

    @PostMapping("/upload")
    public String uploadMarkdown(@RequestParam("file") MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new RuntimeException("文件为空");
        }

        String projectPath = System.getProperty("user.dir");
        String uploadDir = projectPath + "/uploads/markdowns/";
        
        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String originalFilename = file.getOriginalFilename();
        String fileExtension = originalFilename != null ? originalFilename.substring(originalFilename.lastIndexOf(".")) : ".md";
        String fileName = UUID.randomUUID().toString() + fileExtension;

        File dest = new File(dir, fileName);
        file.transferTo(dest);

        return "/uploads/markdowns/" + fileName;
    }


}