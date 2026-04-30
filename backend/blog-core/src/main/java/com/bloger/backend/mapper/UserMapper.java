package com.bloger.backend.mapper;

import com.bloger.backend.entity.User;

import java.util.List;
import java.util.Map;

public interface UserMapper {
    User selectById(Long id);
    User selectByUsername(String username);
    User selectByEmail(String email);
    List<User> selectList();
    int insert(User user);
    int update(User user);
    int delete(Long id);
    long count();
    List<Map<String, Object>> getRecentActivities();
}