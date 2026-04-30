package com.bloger.backend.service.impl;

import com.bloger.backend.entity.ImageDirectory;
import com.bloger.backend.entity.ImagePath;
import com.bloger.backend.mapper.ImageDirectoryMapper;
import com.bloger.backend.mapper.ImagePathMapper;
import com.bloger.backend.service.ImageStorageService;
import com.bloger.backend.util.CosUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ImageStorageServiceImpl implements ImageStorageService {

    private static final String CDN_BASE_URL = "https://cdn.moliya.love";

    @Autowired
    private ImageDirectoryMapper directoryMapper;

    @Autowired
    private ImagePathMapper imagePathMapper;

    @Autowired
    private CosUtil cosUtil;

    @Override
    public List<ImageDirectory> getRootDirectories() {
        return directoryMapper.selectRootDirectories();
    }

    @Override
    public List<ImageDirectory> getChildDirectories(Long parentId) {
        return directoryMapper.selectByParentId(parentId);
    }

    @Override
    public ImageDirectory getById(Long id) {
        return directoryMapper.selectById(id);
    }

    @Override
    @Transactional
    public ImageDirectory getOrCreateDirectory(String path, Long parentId) {
        ImageDirectory existing = directoryMapper.selectByPath(path);
        if (existing != null) {
            return existing;
        }

        // 解析目录名
        String name = path;
        int lastSlash = path.lastIndexOf('/', path.length() - 2);
        if (lastSlash >= 0) {
            name = path.substring(lastSlash + 1, path.length() - 1);
        }

        ImageDirectory directory = new ImageDirectory();
        directory.setName(name);
        directory.setPath(path);
        directory.setParentId(parentId);
        directory.setImageCount(0);
        directory.setSort(0);
        directoryMapper.insert(directory);

        return directory;
    }

    @Override
    public Map<String, Object> getImagesByDirectory(Long directoryId, int page, int size) {
        int offset = (page - 1) * size;
        List<ImagePath> images = imagePathMapper.selectByDirectoryId(directoryId, offset, size);
        long total = imagePathMapper.countByDirectoryId(directoryId);

        Map<String, Object> result = new HashMap<>();
        result.put("images", images);
        result.put("total", total);
        result.put("page", page);
        result.put("size", size);
        result.put("totalPages", (total + size - 1) / size);

        return result;
    }

    @Override
    public ImagePath getImageById(Long id) {
        return imagePathMapper.selectById(id);
    }

    @Override
    public ImagePath getImageByCosKey(String cosKey) {
        return imagePathMapper.selectByCosKey(cosKey);
    }

    @Override
    @Transactional
    public ImagePath saveImage(ImagePath imagePath) {
        if (imagePath.getCosKey() == null || imagePath.getCosKey().isEmpty()) {
            throw new IllegalArgumentException("cosKey must not be empty");
        }
        // 确保目录存在
        ImageDirectory dir = directoryMapper.selectById(imagePath.getDirectoryId());
        if (dir == null) {
            throw new IllegalArgumentException("Directory not found: " + imagePath.getDirectoryId());
        }

        // 检查是否已存在相同 cos_key 的记录
        ImagePath existing = imagePathMapper.selectByCosKey(imagePath.getCosKey());
        if (existing != null) {
            return existing;
        }

        // 设置 CDN URL
        if (imagePath.getCdnUrl() == null || imagePath.getCdnUrl().isEmpty()) {
            imagePath.setCdnUrl(CDN_BASE_URL + "/" + imagePath.getCosKey());
        }

        imagePathMapper.insert(imagePath);

        // 更新目录计数
        directoryMapper.incrementImageCount(imagePath.getDirectoryId());

        return imagePath;
    }

    @Override
    @Transactional
    public void deleteImage(Long id) {
        ImagePath image = imagePathMapper.selectById(id);
        if (image != null) {
            // 删除COS文件
            cosUtil.deleteObject(image.getCosKey());
            // 删除数据库记录
            imagePathMapper.delete(id);
            directoryMapper.decrementImageCount(image.getDirectoryId());
        }
    }

    @Override
    @Transactional
    public void deleteImageByCosKey(String cosKey) {
        ImagePath image = imagePathMapper.selectByCosKey(cosKey);
        if (image != null) {
            // 删除COS文件
            cosUtil.deleteObject(cosKey);
            // 删除数据库记录
            imagePathMapper.delete(image.getId());
            directoryMapper.decrementImageCount(image.getDirectoryId());
        }
    }

    @Override
    @Transactional
    public void moveImage(String sourceKey, String destinationKey) {
        // 1. 复制COS文件到新位置
        cosUtil.copyObject(sourceKey, destinationKey);

        // 2. 更新数据库记录
        ImagePath image = imagePathMapper.selectByCosKey(sourceKey);
        if (image != null) {
            // 获取目标目录
            String destDir = destinationKey.substring(0, destinationKey.lastIndexOf('/') + 1);
            ImageDirectory dir = directoryMapper.selectByPath(destDir);
            if (dir != null) {
                // 更新前先记录旧目录ID（更新后 image.getDirectoryId() 就指向新目录了）
                Long oldDirectoryId = image.getDirectoryId();

                // 更新图片记录
                image.setCosKey(destinationKey);
                image.setDirectoryId(dir.getId());
                imagePathMapper.updateById(image);

                // 更新源目录计数
                if (oldDirectoryId != null) {
                    directoryMapper.decrementImageCount(oldDirectoryId);
                }
                // 更新目标目录计数
                directoryMapper.incrementImageCount(dir.getId());
            }
        }
    }

    @Override
    @Transactional
    public void renameImage(String oldKey, String newKey) {
        moveImage(oldKey, newKey);
    }

    @Override
    @Transactional
    public void createFolder(String folderKey) {
        // 1. 在COS创建文件夹
        cosUtil.createFolder(folderKey);

        // 2. 在数据库创建目录记录
        getOrCreateDirectory(folderKey, null);
    }

    @Override
    public List<ImageDirectory> getAllDirectories() {
        return directoryMapper.selectAll();
    }
}