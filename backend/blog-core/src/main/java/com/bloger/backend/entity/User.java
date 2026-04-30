package com.bloger.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import java.util.Date;

@Data
public class User {
    private Long id;
    private String username;
    @JsonIgnore
    private String password;
    private String email;
    private String avatar;
    private Integer status;
    private Boolean emailVerified;
    private Boolean admin;
    private Date lastLoginTime;
    private Date createTime;
    private Date updateTime;
}