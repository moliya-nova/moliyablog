package com.bloger.backend.controller;

import com.bloger.backend.entity.ImageDirectory;
import com.bloger.backend.entity.ImagePath;
import com.bloger.backend.service.CosSyncService;
import com.bloger.backend.service.ImageStorageService;
import com.bloger.backend.util.CosUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@RestController
@RequestMapping("/api/files")
public class FileController {

    private final CosUtil cosUtil;
    private final ImageStorageService imageStorageService;
    private final CosSyncService cosSyncService;

    @Autowired
    public FileController(CosUtil cosUtil, ImageStorageService imageStorageService, CosSyncService cosSyncService) {
        this.cosUtil = cosUtil;
        this.imageStorageService = imageStorageService;
        this.cosSyncService = cosSyncService;
    }

    @GetMapping("/cos/sign")
    public Map<String, String> getCosSign(
            @RequestParam(required = false, defaultValue = "images") String type,
            @RequestParam String filename,
            @RequestParam(required = false) String folder) {
        String extension = filename.substring(filename.lastIndexOf("."));
        String key;

        if (folder != null && !folder.isEmpty()) {
            String dir = folder.endsWith("/") ? folder : folder + "/";
            key = dir + UUID.randomUUID().toString() + extension;
        } else if ("avatar".equals(type)) {
            key = "avatar/" + UUID.randomUUID().toString() + extension;
        } else if ("images".equals(type)) {
            key = "images/" + UUID.randomUUID().toString() + extension;
        } else {
            key = "article/" + UUID.randomUUID().toString() + extension;
        }
        return cosUtil.generatePresignedUrl(key, 3600);
    }

    @GetMapping("/cos/read")
    public Map<String, String> getCosReadUrl(@RequestParam String key) {
        return cosUtil.generatePresignedGetUrl(key, 3600);
    }

    @GetMapping("/cos/list")
    public List<Map<String, Object>> listCosObjects(@RequestParam(required = false, defaultValue = "") String prefix) {
        return cosUtil.listObjects(prefix);
    }

    // ==================== 图片管理新接口 ====================

    /**
     * 获取顶级目录列表
     */
    @GetMapping("/directories")
    public List<ImageDirectory> getRootDirectories() {
        return imageStorageService.getRootDirectories();
    }

    /**
     * 获取子目录列表
     */
    @GetMapping("/directories/{id}/children")
    public List<ImageDirectory> getChildDirectories(@PathVariable Long id) {
        return imageStorageService.getChildDirectories(id);
    }

    /**
     * 获取目录下的图片（分页）
     */
    @GetMapping("/directories/{id}/images")
    public Map<String, Object> getDirectoryImages(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {
        return imageStorageService.getImagesByDirectory(id, page, size);
    }

    /**
     * 上传图片
     */
    @PostMapping("/upload")
    public Map<String, Object> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false, defaultValue = "images") String directory,
            @RequestParam(required = false) Long uploaderId) {

        try {
            // 1. 上传到COS
            String key = cosUtil.uploadFile(file, directory);

            // 2. 获取或创建目录记录
            String path = directory.endsWith("/") ? directory : directory + "/";
            ImageDirectory dir = imageStorageService.getOrCreateDirectory(path, null);

            // 3. 创建图片记录
            ImagePath imagePath = new ImagePath();
            imagePath.setDirectoryId(dir.getId());
            imagePath.setCosKey(key);
            imagePath.setFilename(file.getOriginalFilename());
            imagePath.setSize(file.getSize());
            imagePath.setUploaderId(uploaderId);
            imagePath = imageStorageService.saveImage(imagePath);

            Map<String, Object> result = new HashMap<>();
            result.put("id", imagePath.getId());
            result.put("key", key);
            result.put("cdnUrl", imagePath.getCdnUrl());
            result.put("filename", imagePath.getFilename());
            return result;

        } catch (Exception e) {
            throw new RuntimeException("Upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * 删除图片
     */
    @DeleteMapping("/images/{id}")
    public void deleteImage(@PathVariable Long id) {
        ImagePath image = imageStorageService.getImageById(id);
        if (image != null) {
            // 删除COS文件
            cosUtil.deleteObject(image.getCosKey());
            // 删除数据库记录
            imageStorageService.deleteImage(id);
        }
    }

    /**
     * 保存图片元数据（前端直传COS后，将路径信息入库）
     */
    @PostMapping("/save")
    public Map<String, Object> saveImageMetadata(@RequestBody Map<String, Object> body) {
        String key = (String) body.get("key");
        String filename = (String) body.get("filename");
        Long size = body.get("size") != null ? ((Number) body.get("size")).longValue() : 0;
        String directory = body.get("directory") != null ? (String) body.get("directory") : "images";
        Long uploaderId = body.get("uploaderId") != null ? ((Number) body.get("uploaderId")).longValue() : null;

        String path = directory.endsWith("/") ? directory : directory + "/";
        ImageDirectory dir = imageStorageService.getOrCreateDirectory(path, null);

        ImagePath imagePath = new ImagePath();
        imagePath.setDirectoryId(dir.getId());
        imagePath.setCosKey(key);
        imagePath.setFilename(filename);
        imagePath.setSize(size);
        imagePath.setUploaderId(uploaderId);
        imagePath = imageStorageService.saveImage(imagePath);

        Map<String, Object> result = new HashMap<>();
        result.put("id", imagePath.getId());
        result.put("key", key);
        result.put("cdnUrl", imagePath.getCdnUrl());
        result.put("filename", imagePath.getFilename());
        return result;
    }

    /**
     * 同步COS历史数据到数据库
     */
    @PostMapping("/sync")
    public Map<String, Object> syncFromCos() {
        cosSyncService.syncFromCos();
        return cosSyncService.getSyncProgress();
    }

    /**
     * 获取同步进度
     */
    @GetMapping("/sync/progress")
    public Map<String, Object> getSyncProgress() {
        return cosSyncService.getSyncProgress();
    }
}