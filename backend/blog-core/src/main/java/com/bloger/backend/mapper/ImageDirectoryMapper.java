package com.bloger.backend.mapper;

import com.bloger.backend.entity.ImageDirectory;
import com.bloger.backend.entity.ImagePath;

import java.util.List;

public interface ImageDirectoryMapper {
    ImageDirectory selectById(Long id);
    List<ImageDirectory> selectRootDirectories();
    List<ImageDirectory> selectByParentId(Long parentId);
    List<ImageDirectory> selectAll();
    ImageDirectory selectByPath(String path);
    int insert(ImageDirectory directory);
    int update(ImageDirectory directory);
    int delete(Long id);
    int incrementImageCount(Long id);
    int decrementImageCount(Long id);
}