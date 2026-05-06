package com.bloger.backend.service.impl;

import com.bloger.backend.entity.User;
import com.bloger.backend.mapper.UserMapper;
import com.bloger.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;

    @Override
    public User getById(Long id) {
        return userMapper.selectById(id);
    }

    @Override
    public User getByUsername(String username) {
        return userMapper.selectByUsername(username);
    }

    @Override
    public User getByEmail(String email) {
        return userMapper.selectByEmail(email);
    }

    @Override
    public List<User> list() {
        return userMapper.selectList();
    }

    @Override
    public void save(User user) {
        userMapper.insert(user);
    }

    @Override
    public void update(User user) {
        userMapper.update(user);
    }

    @Override
    public void updateSelective(User user) {
        userMapper.updateSelective(user);
    }

    @Override
    public void delete(Long id) {
        userMapper.delete(id);
    }

    @Override
    public long count() {
        return userMapper.count();
    }

    @Override
    public List<Map<String, Object>> getRecentActivities() {
        return userMapper.getRecentActivities();
    }
}