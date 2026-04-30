package com.bloger.backend.service;

import com.bloger.backend.entity.Tag;

import java.util.List;

public interface TagService {
    Tag getById(Long id);
    List<Tag> list();
    List<Tag> listByArticleId(Long articleId);
    List<Tag> searchByName(String name);
    Tag save(Tag tag);
    void update(Tag tag);
    void delete(Long id);
}