package com.bloger.backend.service;

import com.bloger.backend.entity.ImageDirectory;
import com.bloger.backend.entity.ImagePath;

import java.util.List;
import java.util.Map;

public interface ImageStorageService {
    // 目录操作
    List<ImageDirectory> getRootDirectories();
    List<ImageDirectory> getChildDirectories(Long parentId);
    ImageDirectory getById(Long id);
    ImageDirectory getOrCreateDirectory(String path, Long parentId);

    // 图片操作
    Map<String, Object> getImagesByDirectory(Long directoryId, int page, int size);
    ImagePath getImageById(Long id);
    ImagePath getImageByCosKey(String cosKey);
    ImagePath saveImage(ImagePath imagePath);

    // 删除操作
    void deleteImage(Long id);
    void deleteImageByCosKey(String cosKey);

    // 移动/重命名
    void moveImage(String sourceKey, String destinationKey);
    void renameImage(String oldKey, String newKey);

    // 创建文件夹
    void createFolder(String folderKey);

    // 获取所有目录（用于图库管理树）
    List<ImageDirectory> getAllDirectories();
}