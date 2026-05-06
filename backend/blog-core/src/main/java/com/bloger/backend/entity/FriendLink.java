package com.bloger.backend.entity;

import lombok.Data;
import java.util.Date;

@Data
public class FriendLink {
    private Long id;
    private String name;
    private String avatar;
    private String description;
    private String url;
    private String category;
    private Integer sort;
    private Integer status;
    private Integer isAlive;
    private Date lastCheckTime;
    private String cardStyle;
    private Date createTime;
    private Date updateTime;
}
