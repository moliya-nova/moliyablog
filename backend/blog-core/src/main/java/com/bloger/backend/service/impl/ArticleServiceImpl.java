package com.bloger.backend.service.impl;

import com.bloger.backend.entity.Article;
import com.bloger.backend.entity.ArticleTag;
import com.bloger.backend.entity.Tag;
import com.bloger.backend.mapper.ArticleMapper;
import com.bloger.backend.mapper.ArticleTagMapper;
import com.bloger.backend.mapper.TagMapper;
import com.bloger.backend.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ArticleServiceImpl implements ArticleService {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private ArticleTagMapper articleTagMapper;

    @Autowired
    private TagMapper tagMapper;

    @Override
    public Article getById(Long id) {
        Article article = articleMapper.selectById(id);
        if (article != null) {
            article.setTags(tagMapper.selectByArticleId(id));
        }
        return article;
    }

    @Override
    public List<Article> list() {
        List<Article> articles = articleMapper.selectList();
        for (Article article : articles) {
            article.setTags(tagMapper.selectByArticleId(article.getId()));
        }
        return articles;
    }

    @Override
    public List<Article> listAll() {
        List<Article> articles = articleMapper.selectAllList();
        for (Article article : articles) {
            article.setTags(tagMapper.selectByArticleId(article.getId()));
        }
        return articles;
    }

    @Override
    public List<Article> listByCategoryId(Long categoryId) {
        List<Article> articles = articleMapper.selectByCategoryId(categoryId);
        for (Article article : articles) {
            article.setTags(tagMapper.selectByArticleId(article.getId()));
        }
        return articles;
    }

    @Override
    public List<Article> listByTagId(Long tagId) {
        List<Article> articles = articleMapper.selectByTagId(tagId);
        for (Article article : articles) {
            article.setTags(tagMapper.selectByArticleId(article.getId()));
        }
        return articles;
    }

    @Override
    @Transactional
    public void save(Article article) {
        articleMapper.insert(article);
        saveArticleTags(article);
    }

    @Override
    @Transactional
    public void update(Article article) {
        articleMapper.update(article);
        articleTagMapper.deleteByArticleId(article.getId());
        saveArticleTags(article);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        articleTagMapper.deleteByArticleId(id);
        articleMapper.delete(id);
    }

    @Override
    public void incrementViewCount(Long id) {
        articleMapper.incrementViewCount(id);
    }

    @Override
    public long count() {
        return articleMapper.count();
    }

    @Override
    public long getTotalViewCount() {
        return articleMapper.getTotalViewCount();
    }

    @Override
    public List<Article> listPage(int page, int size) {
        int offset = (page - 1) * size;
        List<Article> articles = articleMapper.selectPage(offset, size);
        for (Article article : articles) {
            article.setTags(tagMapper.selectByArticleId(article.getId()));
        }
        return articles;
    }

    @Override
    public long countPublished() {
        return articleMapper.countByStatus();
    }

    private void saveArticleTags(Article article) {
        if (article.getTags() != null && !article.getTags().isEmpty()) {
            for (Tag tag : article.getTags()) {
                ArticleTag articleTag = new ArticleTag();
                articleTag.setArticleId(article.getId());
                articleTag.setTagId(tag.getId());
                articleTagMapper.insert(articleTag);
            }
        }
    }
}