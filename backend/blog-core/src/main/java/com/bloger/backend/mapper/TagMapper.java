package com.bloger.backend.mapper;

import com.bloger.backend.entity.Tag;

import java.util.List;

public interface TagMapper {
    Tag selectById(Long id);
    List<Tag> selectList();
    List<Tag> selectByArticleId(Long articleId);
    List<Tag> searchByName(String name);
    Integer selectMaxSort();
    long count();
    int insert(Tag tag);
    int update(Tag tag);
    int delete(Long id);
}