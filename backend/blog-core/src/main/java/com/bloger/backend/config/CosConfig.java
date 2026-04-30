package com.bloger.backend.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CosConfig {

    @Value("${cos.secretId}")
    private String secretId;

    @Value("${cos.secretKey}")
    private String secretKey;

    @Value("${cos.bucketName}")
    private String bucketName;

    @Value("${cos.region}")
    private String region;

    @Value("${cos.baseUrl}")
    private String baseUrl;

    @Value("${cos.cdnDomain}")
    private String cdnDomain;

    public String getSecretId() {
        return secretId;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public String getBucketName() {
        return bucketName;
    }

    public String getRegion() {
        return region;
    }

    public String getBaseUrl() {
        return baseUrl;
    }

    public String getCdnDomain() {
        return cdnDomain;
    }
}
