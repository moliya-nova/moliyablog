package com.bloger.backend.service;

import com.bloger.backend.entity.User;

import java.util.List;
import java.util.Map;

public interface UserService {
    User getById(Long id);
    User getByUsername(String username);
    User getByEmail(String email);
    List<User> list();
    void save(User user);
    void update(User user);
    void updateSelective(User user);
    void delete(Long id);
    long count();
    List<Map<String, Object>> getRecentActivities();
}