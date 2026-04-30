package com.bloger.backend.service.impl;

import com.bloger.backend.entity.Guestbook;
import com.bloger.backend.mapper.GuestbookMapper;
import com.bloger.backend.service.GuestbookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GuestbookServiceImpl implements GuestbookService {

    @Autowired
    private GuestbookMapper guestbookMapper;

    @Override
    public List<Guestbook> list() {
        return guestbookMapper.selectList();
    }

    @Override
    public List<Guestbook> listByStatus(Integer status) {
        return guestbookMapper.selectByStatus(status);
    }

    @Override
    public List<Guestbook> listAll() {
        return guestbookMapper.selectAll();
    }

    @Override
    public Guestbook getById(Long id) {
        return guestbookMapper.selectById(id);
    }

    @Override
    public void save(Guestbook guestbook) {
        if (guestbook.getStatus() == null) {
            guestbook.setStatus(1);
        }
        if (guestbook.getSort() == null) {
            guestbook.setSort(0);
        }
        guestbookMapper.insert(guestbook);
    }

    @Override
    public void update(Guestbook guestbook) {
        guestbookMapper.update(guestbook);
    }

    @Override
    public void reply(Long id, String reply) {
        guestbookMapper.reply(id, reply);
    }

    @Override
    public void delete(Long id) {
        guestbookMapper.delete(id);
    }

    @Override
    public long count() {
        return guestbookMapper.count();
    }
}