package com.bloger.backend.entity;

public class SiteStats {
    private long articleCount;
    private long categoryCount;
    private long tagCount;
    private long totalViewCount;
    private long commentCount;
    private long guestbookCount;

    public long getArticleCount() {
        return articleCount;
    }

    public void setArticleCount(long articleCount) {
        this.articleCount = articleCount;
    }

    public long getCategoryCount() {
        return categoryCount;
    }

    public void setCategoryCount(long categoryCount) {
        this.categoryCount = categoryCount;
    }

    public long getTagCount() {
        return tagCount;
    }

    public void setTagCount(long tagCount) {
        this.tagCount = tagCount;
    }

    public long getTotalViewCount() {
        return totalViewCount;
    }

    public void setTotalViewCount(long totalViewCount) {
        this.totalViewCount = totalViewCount;
    }

    public long getCommentCount() {
        return commentCount;
    }

    public void setCommentCount(long commentCount) {
        this.commentCount = commentCount;
    }

    public long getGuestbookCount() {
        return guestbookCount;
    }

    public void setGuestbookCount(long guestbookCount) {
        this.guestbookCount = guestbookCount;
    }
}
