package com.bloger.backend.mapper;

import com.bloger.backend.entity.FriendLinkApply;
import java.util.List;

public interface FriendLinkApplyMapper {
    FriendLinkApply selectById(Long id);
    List<FriendLinkApply> selectList();
    List<FriendLinkApply> selectByStatus(Integer status);
    int insert(FriendLinkApply apply);
    int update(FriendLinkApply apply);
    int delete(Long id);
    long count();
}
