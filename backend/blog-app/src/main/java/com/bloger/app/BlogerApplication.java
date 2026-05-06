package com.bloger.app;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@MapperScan(basePackages = "com.bloger.backend.mapper")
@ComponentScan(basePackages = {"com.bloger.backend", "com.bloger.ai"})
public class BlogerApplication {
    public static void main(String[] args) {
        SpringApplication.run(BlogerApplication.class, args);
    }
}
