package com.bloger.backend.service.impl;

import com.bloger.backend.entity.FriendLink;
import com.bloger.backend.entity.FriendLinkApply;
import com.bloger.backend.mapper.FriendLinkApplyMapper;
import com.bloger.backend.service.FriendLinkApplyService;
import com.bloger.backend.service.FriendLinkService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FriendLinkApplyServiceImpl implements FriendLinkApplyService {

    @Autowired
    private FriendLinkApplyMapper friendLinkApplyMapper;

    @Autowired
    private FriendLinkService friendLinkService;

    @Override
    public List<FriendLinkApply> list() {
        return friendLinkApplyMapper.selectList();
    }

    @Override
    public List<FriendLinkApply> listByStatus(Integer status) {
        return friendLinkApplyMapper.selectByStatus(status);
    }

    @Override
    public FriendLinkApply getById(Long id) {
        return friendLinkApplyMapper.selectById(id);
    }

    @Override
    @Transactional
    public void save(FriendLinkApply apply) {
        apply.setStatus(0);
        friendLinkApplyMapper.insert(apply);
    }

    @Override
    @Transactional
    public void update(FriendLinkApply apply) {
        friendLinkApplyMapper.update(apply);
    }

    @Override
    @Transactional
    public void approve(Long id, String reply) {
        FriendLinkApply apply = friendLinkApplyMapper.selectById(id);
        if (apply == null) {
            return;
        }
        apply.setStatus(1);
        apply.setAdminReply(reply);
        friendLinkApplyMapper.update(apply);

        // 自动创建友链
        FriendLink friendLink = new FriendLink();
        friendLink.setName(apply.getName());
        friendLink.setAvatar(apply.getAvatar());
        friendLink.setDescription(apply.getDescription());
        friendLink.setUrl(apply.getUrl());
        friendLink.setCategory("默认");
        friendLink.setSort(0);
        friendLink.setStatus(1);
        friendLink.setCardStyle("default");
        friendLinkService.save(friendLink);
    }

    @Override
    @Transactional
    public void reject(Long id, String reply) {
        FriendLinkApply apply = friendLinkApplyMapper.selectById(id);
        if (apply == null) {
            return;
        }
        apply.setStatus(2);
        apply.setAdminReply(reply);
        friendLinkApplyMapper.update(apply);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        friendLinkApplyMapper.delete(id);
    }

    @Override
    public long count() {
        return friendLinkApplyMapper.count();
    }
}
