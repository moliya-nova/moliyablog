package com.bloger.backend.mapper;

import com.bloger.backend.entity.Guestbook;
import java.util.List;

public interface GuestbookMapper {
    Guestbook selectById(Long id);
    List<Guestbook> selectList();
    List<Guestbook> selectByStatus(Integer status);
    List<Guestbook> selectAll();
    int insert(Guestbook guestbook);
    int update(Guestbook guestbook);
    int reply(Long id, String reply);
    int delete(Long id);
    long count();
}