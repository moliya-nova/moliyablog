package com.bloger.backend.entity;

import lombok.Data;

import java.util.Date;
import java.util.List;

@Data
public class Article {
    private Long id;
    private String title;
    private String excerpt;
    private String content;
    private Long authorId;
    private String authorName;
    private Long categoryId;
    private String categoryName;
    private String imageUrl;
    private String readTime;
    private Integer viewCount;
    private Integer status;
    private Date createTime;
    private Date updateTime;
    private List<Tag> tags;
}