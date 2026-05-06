package com.bloger.backend.entity;

import lombok.Data;
import java.util.Date;

@Data
public class FriendLinkApply {
    private Long id;
    private String name;
    private String avatar;
    private String description;
    private String url;
    private String email;
    private String reason;
    private Integer status;
    private String adminReply;
    private Date createTime;
    private Date updateTime;
}
