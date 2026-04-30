package com.bloger.backend.service.impl;

import com.bloger.backend.entity.ImageDirectory;
import com.bloger.backend.entity.ImagePath;
import com.bloger.backend.mapper.ImageDirectoryMapper;
import com.bloger.backend.mapper.ImagePathMapper;
import com.bloger.backend.service.CosSyncService;
import com.bloger.backend.util.CosUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
public class CosSyncServiceImpl implements CosSyncService {

    private static final String CDN_BASE_URL = "https://cdn.moliya.love";

    @Autowired
    private CosUtil cosUtil;

    @Autowired
    private ImageDirectoryMapper directoryMapper;

    @Autowired
    private ImagePathMapper imagePathMapper;

    // 同步进度状态
    private final AtomicBoolean syncing = new AtomicBoolean(false);
    private volatile String progress = "idle";
    private volatile int totalFiles = 0;
    private volatile int processedFiles = 0;

    @Override
    @Transactional
    public void syncFromCos() {
        if (!syncing.compareAndSet(false, true)) {
            throw new IllegalStateException("Sync already in progress");
        }
        progress = "Starting sync...";
        processedFiles = 0;
        totalFiles = 0;

        try {
            // 递归同步所有目录
            syncDirectory("", null);

            System.out.println("=== 同步完成: 插入 " + processedFiles + " 条记录 ===");
            progress = "Sync complete! " + processedFiles + " images added";
            syncing.set(false);

        } catch (Exception e) {
            progress = "Sync failed: " + e.getMessage();
            syncing.set(false);
            e.printStackTrace();
            throw new RuntimeException("Sync failed", e);
        }
    }

    private void syncDirectory(String prefix, Long parentDirId) {
        // 获取该目录下的所有文件和子目录
        List<Map<String, Object>> objects = cosUtil.listObjects(prefix);

        System.out.println("同步目录: " + (prefix.isEmpty() ? "根" : prefix) + ", 获取 " + objects.size() + " 个对象");

        // 构建该目录的缓存
        Map<String, ImageDirectory> dirMap = new HashMap<>();

        // 先处理所有子目录
        for (Map<String, Object> obj : objects) {
            String type = (String) obj.get("type");
            if ("folder".equals(type)) {
                String folderKey = (String) obj.get("key");
                ImageDirectory dir = getOrCreateDirectory(folderKey, parentDirId, dirMap);
                // 递归同步子目录
                syncDirectory(folderKey, dir.getId());
            }
        }

        // 再处理文件
        for (Map<String, Object> obj : objects) {
            String type = (String) obj.get("type");
            if ("file".equals(type)) {
                String key = (String) obj.get("key");
                String name = (String) obj.get("name");
                Long size = obj.get("size") != null ? ((Number) obj.get("size")).longValue() : 0;

                // 获取父目录
                String parentPath = "";
                if (!prefix.isEmpty()) {
                    parentPath = prefix;
                } else {
                    int lastSlash = key.lastIndexOf('/');
                    if (lastSlash > 0) {
                        parentPath = key.substring(0, lastSlash + 1);
                    }
                }

                ImageDirectory parentDir = null;
                if (!parentPath.isEmpty()) {
                    parentDir = dirMap.get(parentPath);
                    if (parentDir == null) {
                        parentDir = getOrCreateDirectory(parentPath, parentDirId, dirMap);
                    }
                }

                if (parentDir == null) {
                    System.out.println("跳过文件 (无父目录): " + key);
                    continue;
                }

                // 检查是否已存在
                ImagePath existing = imagePathMapper.selectByCosKey(key);
                if (existing != null) {
                    continue;
                }

                // 创建图片记录
                ImagePath imagePath = new ImagePath();
                imagePath.setDirectoryId(parentDir.getId());
                imagePath.setCosKey(key);
                imagePath.setFilename(name);
                imagePath.setSize(size);
                imagePath.setCdnUrl(CDN_BASE_URL + "/" + key);
                imagePathMapper.insert(imagePath);

                // 更新目录计数
                directoryMapper.incrementImageCount(parentDir.getId());

                processedFiles++;
            }
        }
    }

    private ImageDirectory getOrCreateDirectory(String path, Long parentId, Map<String, ImageDirectory> dirMap) {
        if (dirMap.containsKey(path)) {
            return dirMap.get(path);
        }

        // 检查数据库中是否已存在
        ImageDirectory existing = directoryMapper.selectByPath(path);
        if (existing != null) {
            dirMap.put(path, existing);
            return existing;
        }

        // 解析父路径
        Long actualParentId = parentId;
        String parentPath = null;
        int lastSlash = path.lastIndexOf('/', path.length() - 2);
        if (lastSlash > 0) {
            parentPath = path.substring(0, lastSlash + 1);
            if (dirMap.containsKey(parentPath)) {
                actualParentId = dirMap.get(parentPath).getId();
            } else {
                ImageDirectory parentDir = getOrCreateDirectory(parentPath, parentId, dirMap);
                actualParentId = parentDir.getId();
            }
        }

        // 解析目录名
        String name = path.substring(lastSlash + 1, path.length() - 1);

        // 创建新目录
        ImageDirectory directory = new ImageDirectory();
        directory.setName(name);
        directory.setPath(path);
        directory.setParentId(actualParentId);
        directory.setImageCount(0);
        directory.setSort(0);
        directoryMapper.insert(directory);

        System.out.println("创建目录: " + path + " -> id=" + directory.getId());
        dirMap.put(path, directory);
        return directory;
    }

    @Override
    public Map<String, Object> getSyncProgress() {
        Map<String, Object> result = new HashMap<>();
        result.put("syncing", syncing.get());
        result.put("progress", progress);
        result.put("totalFiles", totalFiles);
        result.put("processedFiles", processedFiles);
        return result;
    }
}