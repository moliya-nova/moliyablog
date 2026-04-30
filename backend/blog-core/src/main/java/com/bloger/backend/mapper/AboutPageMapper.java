package com.bloger.backend.mapper;

import com.bloger.backend.entity.AboutPage;

public interface AboutPageMapper {
    AboutPage selectById(Long id);
    int insert(AboutPage aboutPage);
    int update(AboutPage aboutPage);
}
