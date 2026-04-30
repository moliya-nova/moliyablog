package com.bloger.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.mybatis.spring.annotation.MapperScan;

@SpringBootApplication
@MapperScan(basePackages = "com.bloger.backend.mapper")
public class BlogerApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogerApplication.class, args);
    }
}