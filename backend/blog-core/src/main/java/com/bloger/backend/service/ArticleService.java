package com.bloger.backend.service;

import com.bloger.backend.entity.Article;

import java.util.List;

public interface ArticleService {
    Article getById(Long id);
    List<Article> list();
    List<Article> listAll();
    List<Article> listByCategoryId(Long categoryId);
    List<Article> listByTagId(Long tagId);
    void save(Article article);
    void update(Article article);
    void delete(Long id);
    void incrementViewCount(Long id);
    long count();
    long getTotalViewCount();
    List<Article> listPage(int page, int size);
    long countPublished();
}