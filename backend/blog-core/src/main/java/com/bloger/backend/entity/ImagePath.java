package com.bloger.backend.entity;

import lombok.Data;
import java.util.Date;

@Data
public class ImagePath {
    private Long id;
    private Long directoryId;
    private String cosKey;
    private String filename;
    private Long size;
    private String cdnUrl;
    private Long uploaderId;
    private Date createTime;
}