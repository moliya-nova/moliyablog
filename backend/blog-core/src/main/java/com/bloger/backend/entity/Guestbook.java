package com.bloger.backend.entity;

import lombok.Data;
import java.util.Date;

@Data
public class Guestbook {
    private Long id;
    private String content;
    private String authorName;
    private String authorEmail;
    private String authorAvatar;
    private String reply;
    private Date replyTime;
    private Integer status;
    private Integer sort;
    private Date createTime;
    private Date updateTime;
}