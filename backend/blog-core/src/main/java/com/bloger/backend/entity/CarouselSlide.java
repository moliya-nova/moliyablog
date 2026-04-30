package com.bloger.backend.entity;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CarouselSlide {
    private Long id;
    private String imageUrl;
    private String title;
    private String category;
    private Integer sort;
    private Integer status;
    private LocalDateTime createTime;
    private LocalDateTime updateTime;
}
