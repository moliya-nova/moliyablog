package com.bloger.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AboutPage {
    private Long id;
    private String profile;
    private String stats;
    private String skills;
    private String contact;
    private String experience;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
