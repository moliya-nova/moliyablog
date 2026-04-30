package com.bloger.backend.controller;

import com.bloger.backend.entity.Tag;
import com.bloger.backend.service.TagService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
public class TagController {

    @Autowired
    private TagService tagService;

    @GetMapping
    public List<Tag> list() {
        return tagService.list();
    }

    @GetMapping("/article/{id}")
    public List<Tag> listByArticleId(@PathVariable Long id) {
        return tagService.listByArticleId(id);
    }

    @GetMapping("/{id}")
    public Tag getById(@PathVariable Long id) {
        return tagService.getById(id);
    }

    @GetMapping("/search")
    public List<Tag> searchByName(@RequestParam String name) {
        return tagService.searchByName(name);
    }

    @PostMapping
    public Tag save(@RequestBody Tag tag) {
        return tagService.save(tag);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody Tag tag) {
        tag.setId(id);
        tagService.update(tag);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        tagService.delete(id);
    }
}