package com.bloger.backend.service;

import com.bloger.backend.entity.Comment;

import java.util.List;

public interface CommentService {
    Comment getById(Long id);
    List<Comment> listByArticleId(Long articleId);
    List<Comment> list();
    void save(Comment comment);
    void update(Comment comment);
    void delete(Long id);
    long count();
}