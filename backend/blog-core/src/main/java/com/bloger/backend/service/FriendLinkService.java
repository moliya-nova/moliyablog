package com.bloger.backend.service;

import com.bloger.backend.entity.FriendLink;
import java.util.List;

public interface FriendLinkService {
    List<FriendLink> list();
    List<FriendLink> listByStatus(Integer status);
    List<FriendLink> listAll();
    FriendLink getById(Long id);
    void save(FriendLink friendLink);
    void update(FriendLink friendLink);
    void delete(Long id);
    void checkStatus(Long id);
    void checkAllStatus();
    long count();
}
