package com.bloger.backend.service.impl;

import com.bloger.backend.entity.Category;
import com.bloger.backend.exception.BusinessException;
import com.bloger.backend.mapper.ArticleMapper;
import com.bloger.backend.mapper.CategoryMapper;
import com.bloger.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryMapper categoryMapper;

    @Autowired
    private ArticleMapper articleMapper;

    @Override
    public Category getById(Long id) {
        return categoryMapper.selectById(id);
    }

    @Override
    public List<Category> list() {
        return categoryMapper.selectList();
    }

    @Override
    public void save(Category category) {
        categoryMapper.insert(category);
    }

    @Override
    public void update(Category category) {
        categoryMapper.update(category);
    }

    @Override
    public void delete(Long id) {
        Category category = categoryMapper.selectById(id);
        if (category == null) {
            throw new BusinessException(404, "分类不存在");
        }

        long count = articleMapper.countByCategoryId(id);
        if (count > 0) {
            throw new BusinessException(400, "该分类下有 " + count + " 篇文章，不能删除");
        }

        categoryMapper.delete(id);
    }
}