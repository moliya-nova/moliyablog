package com.bloger.backend.mapper;

import com.bloger.backend.entity.Page;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PageMapper {
    Page selectById(Long id);
    Page selectBySlug(String slug);
    List<Page> selectList();
    int insert(Page page);
    int update(Page page);
    int delete(Long id);
}
