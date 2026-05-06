package com.bloger.backend.service;

import com.bloger.backend.entity.FriendLinkApply;
import java.util.List;

public interface FriendLinkApplyService {
    List<FriendLinkApply> list();
    List<FriendLinkApply> listByStatus(Integer status);
    FriendLinkApply getById(Long id);
    void save(FriendLinkApply apply);
    void update(FriendLinkApply apply);
    void approve(Long id, String reply);
    void reject(Long id, String reply);
    void delete(Long id);
    long count();
}
