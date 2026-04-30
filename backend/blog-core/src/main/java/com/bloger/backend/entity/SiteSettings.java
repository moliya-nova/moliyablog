package com.bloger.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class SiteSettings {
    private Long id;
    private String key;
    private String value;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
