package com.bloger.backend.controller;

import com.bloger.backend.entity.Category;
import com.bloger.backend.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    @GetMapping
    public List<Category> list() {
        return categoryService.list();
    }

    @GetMapping("/{id}")
    public Category getById(@PathVariable Long id) {
        return categoryService.getById(id);
    }

    @PostMapping
    public void save(@RequestBody Category category) {
        categoryService.save(category);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody Category category) {
        category.setId(id);
        categoryService.update(category);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        categoryService.delete(id);
    }
}