package com.bloger.backend.controller;

import com.bloger.backend.entity.Page;
import com.bloger.backend.service.PageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pages")
public class PageController {

    @Autowired
    private PageService pageService;

    @GetMapping
    public List<Page> list() {
        return pageService.list();
    }

    @GetMapping("/{id}")
    public Page getById(@PathVariable Long id) {
        return pageService.getById(id);
    }

    @GetMapping("/slug/{slug}")
    public Page getBySlug(@PathVariable String slug) {
        return pageService.getBySlug(slug);
    }

    @PostMapping
    public void save(@RequestBody Page page) {
        pageService.save(page);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody Page page) {
        page.setId(id);
        pageService.update(page);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        pageService.delete(id);
    }
}
