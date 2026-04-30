package com.bloger.backend.service;

import com.bloger.backend.entity.AboutPage;

public interface AboutPageService {
    AboutPage getById(Long id);
    void save(AboutPage aboutPage);
}
