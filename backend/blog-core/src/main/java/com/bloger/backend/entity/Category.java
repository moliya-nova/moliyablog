package com.bloger.backend.entity;

import lombok.Data;

import java.util.Date;

@Data
public class Category {
    private Long id;
    private String name;
    private String description;
    private Integer sort;
    private Date createTime;
    private Date updateTime;
}