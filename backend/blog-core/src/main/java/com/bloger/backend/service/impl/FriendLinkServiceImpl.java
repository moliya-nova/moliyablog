package com.bloger.backend.service.impl;

import com.bloger.backend.entity.FriendLink;
import com.bloger.backend.mapper.FriendLinkMapper;
import com.bloger.backend.service.FriendLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Date;
import java.util.List;

@Service
public class FriendLinkServiceImpl implements FriendLinkService {

    @Autowired
    private FriendLinkMapper friendLinkMapper;

    @Override
    public List<FriendLink> list() {
        return friendLinkMapper.selectList();
    }

    @Override
    public List<FriendLink> listByStatus(Integer status) {
        return friendLinkMapper.selectByStatus(status);
    }

    @Override
    public List<FriendLink> listAll() {
        return friendLinkMapper.selectAll();
    }

    @Override
    public FriendLink getById(Long id) {
        return friendLinkMapper.selectById(id);
    }

    @Override
    @Transactional
    public void save(FriendLink friendLink) {
        friendLink.setIsAlive(1);
        friendLink.setLastCheckTime(new Date());
        friendLinkMapper.insert(friendLink);
    }

    @Override
    @Transactional
    public void update(FriendLink friendLink) {
        friendLinkMapper.update(friendLink);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        friendLinkMapper.delete(id);
    }

    @Override
    @Transactional
    public void checkStatus(Long id) {
        FriendLink friendLink = friendLinkMapper.selectById(id);
        if (friendLink == null) {
            return;
        }
        boolean isAlive = checkUrlAlive(friendLink.getUrl());
        friendLinkMapper.updateCheckStatus(id, isAlive ? 1 : 0);
    }

    @Override
    @Transactional
    public void checkAllStatus() {
        List<FriendLink> friendLinks = friendLinkMapper.selectAll();
        for (FriendLink friendLink : friendLinks) {
            boolean isAlive = checkUrlAlive(friendLink.getUrl());
            friendLinkMapper.updateCheckStatus(friendLink.getId(), isAlive ? 1 : 0);
        }
    }

    @Override
    public long count() {
        return friendLinkMapper.count();
    }

    private boolean checkUrlAlive(String urlStr) {
        try {
            URL url = new URL(urlStr);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("HEAD");
            connection.setConnectTimeout(5000);
            connection.setReadTimeout(5000);
            int responseCode = connection.getResponseCode();
            return responseCode >= 200 && responseCode < 400;
        } catch (Exception e) {
            return false;
        }
    }
}
