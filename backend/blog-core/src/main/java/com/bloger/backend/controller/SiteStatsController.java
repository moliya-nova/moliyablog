package com.bloger.backend.controller;

import com.bloger.backend.entity.SiteStats;
import com.bloger.backend.mapper.ArticleMapper;
import com.bloger.backend.mapper.CategoryMapper;
import com.bloger.backend.mapper.CommentMapper;
import com.bloger.backend.mapper.GuestbookMapper;
import com.bloger.backend.mapper.TagMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/site-stats")
public class SiteStatsController {

    @Autowired
    private ArticleMapper articleMapper;

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private TagMapper tagMapper;

    @Autowired
    private CommentMapper commentMapper;

    @Autowired
    private GuestbookMapper guestbookMapper;

    @GetMapping
    public SiteStats getSiteStats() {
        SiteStats stats = new SiteStats();
        stats.setArticleCount(articleMapper.countByStatus());
        stats.setCategoryCount(categoryMapper.count());
        stats.setTagCount(tagMapper.count());
        stats.setTotalViewCount(articleMapper.getTotalViewCount());
        stats.setCommentCount(commentMapper.count());
        stats.setGuestbookCount(guestbookMapper.count());
        return stats;
    }
}
