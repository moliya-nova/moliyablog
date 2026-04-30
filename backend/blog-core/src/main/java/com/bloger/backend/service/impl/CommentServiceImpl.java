package com.bloger.backend.service.impl;

import com.bloger.backend.entity.Comment;
import com.bloger.backend.mapper.CommentMapper;
import com.bloger.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public Comment getById(Long id) {
        return commentMapper.selectById(id);
    }

    @Override
    public List<Comment> listByArticleId(Long articleId) {
        return commentMapper.selectByArticleId(articleId);
    }

    @Override
    public List<Comment> list() {
        return commentMapper.selectList();
    }

    @Override
    public void save(Comment comment) {
        commentMapper.insert(comment);
    }

    @Override
    public void update(Comment comment) {
        commentMapper.update(comment);
    }

    @Override
    public void delete(Long id) {
        commentMapper.delete(id);
    }

    @Override
    public long count() {
        return commentMapper.count();
    }
}