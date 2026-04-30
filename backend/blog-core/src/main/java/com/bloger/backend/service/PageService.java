package com.bloger.backend.service;

import com.bloger.backend.entity.Page;

import java.util.List;

public interface PageService {
    Page getById(Long id);
    Page getBySlug(String slug);
    List<Page> list();
    void save(Page page);
    void update(Page page);
    void delete(Long id);
}
