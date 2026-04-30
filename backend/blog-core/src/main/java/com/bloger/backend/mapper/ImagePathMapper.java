package com.bloger.backend.mapper;

import com.bloger.backend.entity.ImagePath;
import org.apache.ibatis.annotations.Param;

import java.util.List;

public interface ImagePathMapper {
    ImagePath selectById(Long id);
    List<ImagePath> selectByDirectoryId(@Param("directoryId") Long directoryId, @Param("offset") int offset, @Param("limit") int limit);
    long countByDirectoryId(Long directoryId);
    ImagePath selectByCosKey(String cosKey);
    int insert(ImagePath imagePath);
    int updateById(ImagePath imagePath);
    int delete(Long id);
    int deleteByDirectoryId(Long directoryId);
}