package com.bloger.backend.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Page {
    private Long id;
    private String slug;
    private String title;
    private String content;
    private Integer status;
    private Date createTime;
    private Date updateTime;
}
