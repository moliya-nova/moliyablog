package com.bloger.backend.controller;

import com.bloger.backend.entity.Comment;
import com.bloger.backend.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @GetMapping
    public List<Comment> list() {
        return commentService.list();
    }

    @GetMapping("/article/{id}")
    public List<Comment> listByArticleId(@PathVariable Long id) {
        return commentService.listByArticleId(id);
    }

    @GetMapping("/{id}")
    public Comment getById(@PathVariable Long id) {
        return commentService.getById(id);
    }

    @PostMapping
    public void save(@RequestBody Comment comment) {
        // 从SecurityContext中获取当前登录用户
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.isAuthenticated()) {
            String username = authentication.getName();
            // 可以将用户名设置到评论中
            comment.setAuthorName(username);
        }
        commentService.save(comment);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody Comment comment) {
        comment.setId(id);
        commentService.update(comment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        commentService.delete(id);
    }
}