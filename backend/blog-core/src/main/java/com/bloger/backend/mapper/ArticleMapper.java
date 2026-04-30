package com.bloger.backend.mapper;

import com.bloger.backend.entity.Article;

import java.util.List;

public interface ArticleMapper {
    Article selectById(Long id);
    List<Article> selectList();
    List<Article> selectAllList();
    List<Article> selectByCategoryId(Long categoryId);
    List<Article> selectByTagId(Long tagId);
    int insert(Article article);
    int update(Article article);
    int delete(Long id);
    int incrementViewCount(Long id);
    long count();
    long getTotalViewCount();
    List<Article> selectPage(int offset, int limit);
    long countByStatus();
    long countByCategoryId(Long categoryId);
}