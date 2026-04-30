package com.bloger.backend.controller;

import com.bloger.backend.service.ArticleService;
import com.bloger.backend.service.CommentService;
import com.bloger.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private UserService userService;

    @Autowired
    private ArticleService articleService;

    @Autowired
    private CommentService commentService;

    @GetMapping
    public Map<String, Object> getDashboardData() {
        Map<String, Object> data = new HashMap<>();
        
        // 获取用户总数
        long userCount = userService.count();
        data.put("userCount", userCount);
        
        // 获取文章总数
        long articleCount = articleService.count();
        data.put("articleCount", articleCount);
        
        // 获取评论总数
        long commentCount = commentService.count();
        data.put("commentCount", commentCount);
        
        // 获取总浏览量
        long totalViewCount = articleService.getTotalViewCount();
        data.put("totalViewCount", totalViewCount);
        
        // 获取最近活动
        data.put("recentActivities", userService.getRecentActivities());
        
        return data;
    }
}
