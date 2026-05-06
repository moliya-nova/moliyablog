package com.bloger.backend.mapper;

import com.bloger.backend.entity.FriendLink;
import java.util.List;

public interface FriendLinkMapper {
    FriendLink selectById(Long id);
    List<FriendLink> selectList();
    List<FriendLink> selectByStatus(Integer status);
    List<FriendLink> selectAll();
    int insert(FriendLink friendLink);
    int update(FriendLink friendLink);
    int delete(Long id);
    int updateCheckStatus(Long id, Integer isAlive);
    long count();
}
