package com.bloger.backend.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Comment {
    private Long id;
    private Long articleId;
    private String content;
    private String authorName;
    private String authorEmail;
    private String authorWebsite;
    private Long parentId;
    private Integer status;
    private Date createTime;
    private Date updateTime;
}