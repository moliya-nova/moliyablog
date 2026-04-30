package com.bloger.backend.mapper;

import com.bloger.backend.entity.Comment;

import java.util.List;

public interface CommentMapper {
    Comment selectById(Long id);
    List<Comment> selectByArticleId(Long articleId);
    List<Comment> selectList();
    int insert(Comment comment);
    int update(Comment comment);
    int delete(Long id);
    long count();
}