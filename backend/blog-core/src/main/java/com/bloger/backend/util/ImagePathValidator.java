package com.bloger.backend.util;

import org.springframework.stereotype.Component;

@Component
public class ImagePathValidator {

    private static final String IMAGE_PATH_PATTERN = "^/images/[^/]+\\.[a-zA-Z0-9]+$";
    private static final String AVATAR_PATH_PATTERN = "^/avatar/[^/]+\\.[a-zA-Z0-9]+$";
    private static final String ARTICLE_IMAGE_PATH_PATTERN = "^/article/[^/]+\\.[a-zA-Z0-9]+$";

    public boolean isValidImagePath(String path) {
        if (path == null || path.isEmpty()) {
            return true;
        }
        return path.matches(IMAGE_PATH_PATTERN);
    }

    public boolean isValidAvatarPath(String path) {
        if (path == null || path.isEmpty()) {
            return true;
        }
        return path.matches(AVATAR_PATH_PATTERN);
    }

    public boolean isValidArticleImagePath(String path) {
        if (path == null || path.isEmpty()) {
            return true;
        }
        return path.matches(ARTICLE_IMAGE_PATH_PATTERN);
    }

    public boolean isValidAnyImagePath(String path) {
        if (path == null || path.isEmpty()) {
            return true;
        }
        return isValidImagePath(path) || isValidAvatarPath(path) || isValidArticleImagePath(path);
    }

    public void validateImagePath(String path) {
        if (path != null && !path.isEmpty() && !isValidImagePath(path) && !isValidArticleImagePath(path)) {
            throw new IllegalArgumentException("图片路径格式不正确，应为 /images/xxx.jpg 或 /article/xxx.jpg 格式");
        }
    }

    public void validateAvatarPath(String path) {
        if (path != null && !path.isEmpty() && !isValidAvatarPath(path)) {
            throw new IllegalArgumentException("头像路径格式不正确，应为 /avatar/xxx.jpg 格式");
        }
    }

    public void validateAnyImagePath(String path) {
        if (path != null && !path.isEmpty() && !isValidAnyImagePath(path)) {
            throw new IllegalArgumentException("图片路径格式不正确，应为 /images/xxx.jpg、/article/xxx.jpg 或 /avatar/xxx.jpg 格式");
        }
    }
}
