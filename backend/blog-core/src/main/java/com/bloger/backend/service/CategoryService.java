package com.bloger.backend.service;

import com.bloger.backend.entity.Category;

import java.util.List;

public interface CategoryService {
    Category getById(Long id);
    List<Category> list();
    void save(Category category);
    void update(Category category);
    void delete(Long id);
}