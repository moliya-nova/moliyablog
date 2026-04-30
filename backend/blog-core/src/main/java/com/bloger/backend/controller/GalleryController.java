package com.bloger.backend.controller;

import com.bloger.backend.entity.ImageDirectory;
import com.bloger.backend.entity.ImagePath;
import com.bloger.backend.service.ImageStorageService;
import com.bloger.backend.util.CosUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/gallery")
public class GalleryController {

    private final ImageStorageService imageStorageService;
    private final CosUtil cosUtil;

    @Autowired
    public GalleryController(ImageStorageService imageStorageService, CosUtil cosUtil) {
        this.imageStorageService = imageStorageService;
        this.cosUtil = cosUtil;
    }

    /**
     * 获取指定目录下的子目录和图片
     */
    @GetMapping("/list")
    public List<Map<String, Object>> listObjects(
            @RequestParam("prefix") String prefix,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "100") int size) {
        List<Map<String, Object>> items = new ArrayList<>();

        // 如果prefix为空，获取根目录下的子目录
        if (prefix == null || prefix.isEmpty()) {
            List<ImageDirectory> rootDirs = imageStorageService.getRootDirectories();
            for (ImageDirectory dir : rootDirs) {
                Map<String, Object> folder = new HashMap<>();
                folder.put("type", "folder");
                folder.put("key", dir.getPath());
                folder.put("name", dir.getName());
                items.add(folder);
            }
            return items;
        }

        // 查找指定目录的ID
        ImageDirectory targetDir = null;
        List<ImageDirectory> allDirs = imageStorageService.getAllDirectories();
        for (ImageDirectory dir : allDirs) {
            if (dir.getPath().equals(prefix)) {
                targetDir = dir;
                break;
            }
        }

        if (targetDir != null) {
            // 获取子目录
            List<ImageDirectory> childDirs = imageStorageService.getChildDirectories(targetDir.getId());
            for (ImageDirectory dir : childDirs) {
                Map<String, Object> folder = new HashMap<>();
                folder.put("type", "folder");
                folder.put("key", dir.getPath());
                folder.put("name", dir.getName());
                items.add(folder);
            }

            // 获取图片（分页）
            Map<String, Object> pageResult = imageStorageService.getImagesByDirectory(targetDir.getId(), page, size);
            @SuppressWarnings("unchecked")
            List<ImagePath> images = (List<ImagePath>) pageResult.get("images");
            for (ImagePath image : images) {
                Map<String, Object> file = new HashMap<>();
                file.put("type", "file");
                file.put("key", image.getCosKey());
                String cosKey = image.getCosKey();
                String displayName = cosKey.substring(cosKey.lastIndexOf('/') + 1);
                file.put("name", displayName);
                file.put("size", image.getSize());
                file.put("cosUrl", image.getCdnUrl());
                items.add(file);
            }
        }

        return items;
    }

    /**
     * 获取上传签名
     */
    @PostMapping("/upload/sign")
    public Map<String, String> getUploadSign(@RequestParam("filename") String filename, @RequestParam("folder") String folder) {
        String extension = filename.substring(filename.lastIndexOf("."));
        String key = folder.endsWith("/") ? folder + UUID.randomUUID().toString() + extension
                                         : folder + "/" + UUID.randomUUID().toString() + extension;
        return cosUtil.generatePresignedUrl(key, 3600);
    }

    /**
     * 删除单个文件
     */
    @DeleteMapping("/delete")
    public void deleteObject(@RequestParam("key") String key) {
        imageStorageService.deleteImageByCosKey(key);
    }

    /**
     * 批量删除
     */
    @DeleteMapping("/delete/batch")
    public void deleteObjects(@RequestBody List<String> keys) {
        for (String key : keys) {
            imageStorageService.deleteImageByCosKey(key);
        }
    }

    /**
     * 移动文件
     */
    @PostMapping("/move")
    public void moveObject(@RequestParam("sourceKey") String sourceKey, @RequestParam("destinationKey") String destinationKey) {
        imageStorageService.moveImage(sourceKey, destinationKey);
    }

    /**
     * 重命名文件
     */
    @PostMapping("/rename")
    public void renameObject(@RequestParam("oldKey") String oldKey, @RequestParam("newKey") String newKey) {
        imageStorageService.renameImage(oldKey, newKey);
    }

    /**
     * 创建文件夹
     */
    @PostMapping("/folder/create")
    public void createFolder(@RequestParam("folderKey") String folderKey) {
        imageStorageService.createFolder(folderKey);
    }

    /**
     * 获取目录树（用于图库管理侧边栏）
     */
    @GetMapping("/tree")
    public List<ImageDirectory> getFolderTree() {
        return imageStorageService.getAllDirectories();
    }
}