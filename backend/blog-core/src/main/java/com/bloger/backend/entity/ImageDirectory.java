package com.bloger.backend.entity;

import lombok.Data;
import java.util.Date;

@Data
public class ImageDirectory {
    private Long id;
    private String name;
    private String path;
    private Long parentId;
    private Integer imageCount;
    private Integer sort;
    private Date createTime;
    private Date updateTime;
}