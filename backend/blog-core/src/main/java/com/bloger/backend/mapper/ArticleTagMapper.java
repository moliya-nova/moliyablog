package com.bloger.backend.mapper;

import com.bloger.backend.entity.ArticleTag;

import java.util.List;

public interface ArticleTagMapper {
    List<Long> selectTagIdsByArticleId(Long articleId);
    int insert(ArticleTag articleTag);
    int deleteByArticleId(Long articleId);
    int deleteByTagId(Long tagId);
    long countByTagId(Long tagId);
}