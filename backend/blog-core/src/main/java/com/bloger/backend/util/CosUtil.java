package com.bloger.backend.util;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.web.multipart.MultipartFile;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.bloger.backend.config.CosConfig;
import com.qcloud.cos.COSClient;
import com.qcloud.cos.ClientConfig;
import com.qcloud.cos.auth.BasicCOSCredentials;
import com.qcloud.cos.auth.COSCredentials;
import com.qcloud.cos.http.HttpMethodName;
import com.qcloud.cos.http.HttpProtocol;
import com.qcloud.cos.model.COSObjectSummary;
import com.qcloud.cos.model.CopyObjectRequest;
import com.qcloud.cos.model.DeleteObjectsRequest;
import com.qcloud.cos.model.GeneratePresignedUrlRequest;
import com.qcloud.cos.model.ListObjectsRequest;
import com.qcloud.cos.model.ObjectListing;
import com.qcloud.cos.model.ObjectMetadata;
import com.qcloud.cos.model.PutObjectRequest;
import com.qcloud.cos.region.Region;

/**
 * 腾讯云 COS 对象存储工具类
 * 功能：上传、浏览、删除、复制、创建文件夹、生成临时签名URL
 * 前端图库弹窗核心依赖此类
 */
@Component
public class CosUtil {

    // COS 配置信息（密钥、桶名、地域等）
    private final CosConfig cosConfig;

    // CDN基础URL，用于图片访问
    private final String cdnBaseUrl = "https://cdn.moliya.love";

    // COS 客户端，所有操作都通过它执行
    private COSClient cosClient;

    /**
     * 构造方法：自动注入配置并初始化 COS 客户端
     */
    @Autowired
    public CosUtil(CosConfig cosConfig) {
        this.cosConfig = cosConfig;
        initCosClient();
    }

    /**
     * 初始化 COS 客户端
     * 1. 使用 secretId + secretKey 生成身份凭证
     * 2. 设置地域
     * 3. 使用 HTTPS 协议
     */
    private void initCosClient() {
        // 创建身份凭证
        COSCredentials cred = new BasicCOSCredentials(cosConfig.getSecretId(), cosConfig.getSecretKey());
        // 设置地域
        Region region = new Region(cosConfig.getRegion());
        // 客户端配置
        ClientConfig clientConfig = new ClientConfig(region);
        clientConfig.setHttpProtocol(HttpProtocol.https);
        // 创建客户端
        cosClient = new COSClient(cred, clientConfig);
    }

    /**
     * 生成【上传用】临时签名 URL
     * @param key 文件路径（如：cover/abc.jpg）
     * @param expireTimeSeconds 过期时间（秒）
     * @return 上传URL、文件key、最终访问URL
     */
    public Map<String, String> generatePresignedUrl(String key, int expireTimeSeconds) {
        // 计算过期时间
        Date expiration = new Date(System.currentTimeMillis() + expireTimeSeconds * 1000L);

        // 创建生成预签名URL请求：PUT = 上传
        GeneratePresignedUrlRequest req = new GeneratePresignedUrlRequest(
                cosConfig.getBucketName(),
                key,
                HttpMethodName.PUT
        );
        req.setExpiration(expiration);

        // 生成临时上传URL
        String url = cosClient.generatePresignedUrl(req).toString();

        // 最终可访问的图片URL
        String cosUrl = cosConfig.getBaseUrl() + "/" + key;

        // 封装返回结果
        Map<String, String> result = new HashMap<>();
        result.put("url", url);       // 前端上传用的临时签名URL
        result.put("key", key);       // 文件存储路径
        result.put("cosUrl", cosUrl); // 最终可访问的图片URL
        return result;
    }

    /**
     * 生成【预览/获取用】临时签名 URL
     * @param key 文件路径
     * @param expireTimeSeconds 过期时间
     * @return 临时预览URL
     */
    public Map<String, String> generatePresignedGetUrl(String key, int expireTimeSeconds) {
        Date expiration = new Date(System.currentTimeMillis() + expireTimeSeconds * 1000L);

        GeneratePresignedUrlRequest req = new GeneratePresignedUrlRequest(
                cosConfig.getBucketName(),
                key,
                HttpMethodName.GET
        );
        req.setExpiration(expiration);

        String url = cosClient.generatePresignedUrl(req).toString();

        Map<String, String> result = new HashMap<>();
        result.put("url", url);
        result.put("key", key);
        return result;
    }

    /**
     * 【图库核心方法】列出指定目录下的文件和文件夹
     * @param prefix 目录路径（空=根目录）
     * @return 文件+文件夹列表（type=folder/file）
     */
    public List<Map<String, Object>> listObjects(String prefix) {
        List<Map<String, Object>> objects = new ArrayList<>();

        // 构造列表查询请求
        ListObjectsRequest listObjectsRequest = new ListObjectsRequest();
        listObjectsRequest.setBucketName(cosConfig.getBucketName()); // 指定桶
        listObjectsRequest.setPrefix(prefix);                       // 指定目录
        listObjectsRequest.setDelimiter("/");                       // 按/分隔文件夹

        ObjectListing objectListing;

        // 循环处理分页（COS 默认一次最多1000条）
        do {
            objectListing = cosClient.listObjects(listObjectsRequest);

            // ====================== 1. 添加文件夹 ======================
            for (String commonPrefix : objectListing.getCommonPrefixes()) {
                Map<String, Object> folder = new HashMap<>();
                folder.put("type", "folder");                // 类型：文件夹
                folder.put("key", commonPrefix);            // 完整路径
                folder.put("name", commonPrefix.substring(prefix.length()).replace("/", "")); // 文件夹名称
                objects.add(folder);
            }

            // ====================== 2. 添加文件 ======================
            for (COSObjectSummary objectSummary : objectListing.getObjectSummaries()) {
                // 排除自身目录（避免重复）
                if (!objectSummary.getKey().equals(prefix)) {
                    Map<String, Object> file = new HashMap<>();
                    file.put("type", "file");                              // 类型：文件
                    file.put("key", objectSummary.getKey());               // 完整路径
                    file.put("name", objectSummary.getKey().substring(prefix.length())); // 文件名
                    file.put("size", objectSummary.getSize());             // 文件大小
                    file.put("lastModified", objectSummary.getLastModified()); // 修改时间

                    // 使用CDN URL替代签名URL
                    String cdnUrl = cdnBaseUrl + "/" + objectSummary.getKey();
                    file.put("cosUrl", cdnUrl); // CDN预览URL

                    objects.add(file);
                }
            }

            // 设置下一页标记
            listObjectsRequest.setMarker(objectListing.getNextMarker());

        } while (objectListing.isTruncated()); // 是否还有下一页

        return objects;
    }

    /**
     * 删除单个文件
     * @param key 文件路径
     */
    public void deleteObject(String key) {
        cosClient.deleteObject(cosConfig.getBucketName(), key);
    }

    /**
     * 上传文件到COS
     * @param file 上传的文件
     * @param directory 目标目录（如 "images/"、"article/"）
     * @return COS存储路径key
     */
    public String uploadFile(MultipartFile file, String directory) throws Exception {
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String dir = directory.endsWith("/") ? directory : directory + "/";
        String key = dir + UUID.randomUUID().toString() + extension;

        try (InputStream inputStream = file.getInputStream()) {
            ObjectMetadata metadata = new ObjectMetadata();
            metadata.setContentLength(file.getSize());
            metadata.setContentType(file.getContentType());

            PutObjectRequest putObjectRequest = new PutObjectRequest(
                    cosConfig.getBucketName(),
                    key,
                    inputStream,
                    metadata
            );
            cosClient.putObject(putObjectRequest);
        }

        return key;
    }

    /**
     * 批量删除多个文件
     * @param keys 文件路径列表
     */
    public void deleteObjects(List<String> keys) {
        DeleteObjectsRequest deleteObjectsRequest = new DeleteObjectsRequest(cosConfig.getBucketName());
        List<DeleteObjectsRequest.KeyVersion> keyVersions = new ArrayList<>();

        for (String key : keys) {
            keyVersions.add(new DeleteObjectsRequest.KeyVersion(key));
        }

        deleteObjectsRequest.setKeys(keyVersions);
        cosClient.deleteObjects(deleteObjectsRequest);
    }

    /**
     * 移动文件（复制后删除原文件）
     * @param sourceKey 源文件路径
     * @param destinationKey 目标路径
     */
    public void copyObject(String sourceKey, String destinationKey) {
        CopyObjectRequest copyObjectRequest = new CopyObjectRequest(
                cosConfig.getBucketName(),
                sourceKey,
                cosConfig.getBucketName(),
                destinationKey
        );
        cosClient.copyObject(copyObjectRequest);
        deleteObject(sourceKey); // 复制后删除源文件 = 移动
    }

    /**
     * 创建文件夹（COS 本质是创建一个 / 结尾的空对象）
     * @param folderKey 文件夹路径
     */
    public void createFolder(String folderKey) {
        if (!folderKey.endsWith("/")) {
            folderKey += "/";
        }
        ObjectMetadata metadata = new ObjectMetadata();
        metadata.setContentLength(0); // 空内容

        PutObjectRequest putObjectRequest = new PutObjectRequest(
                cosConfig.getBucketName(),
                folderKey,
                null,
                metadata
        );
        cosClient.putObject(putObjectRequest);
    }

    /**
     * 关闭 COS 客户端
     */
    public void close() {
        if (cosClient != null) {
            cosClient.shutdown();
        }
    }
}