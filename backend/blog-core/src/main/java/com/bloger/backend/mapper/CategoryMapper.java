package com.bloger.backend.mapper;

import com.bloger.backend.entity.Category;

import java.util.List;

public interface CategoryMapper {
    Category selectById(Long id);
    List<Category> selectList();
    int insert(Category category);
    int update(Category category);
    int delete(Long id);
    long count();
}