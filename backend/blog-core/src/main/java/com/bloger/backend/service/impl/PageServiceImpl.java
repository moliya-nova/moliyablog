package com.bloger.backend.service.impl;

import com.bloger.backend.entity.Page;
import com.bloger.backend.mapper.PageMapper;
import com.bloger.backend.service.PageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PageServiceImpl implements PageService {

    @Autowired
    private PageMapper pageMapper;

    @Override
    public Page getById(Long id) {
        return pageMapper.selectById(id);
    }

    @Override
    public Page getBySlug(String slug) {
        return pageMapper.selectBySlug(slug);
    }

    @Override
    public List<Page> list() {
        return pageMapper.selectList();
    }

    @Override
    public void save(Page page) {
        pageMapper.insert(page);
    }

    @Override
    public void update(Page page) {
        pageMapper.update(page);
    }

    @Override
    public void delete(Long id) {
        pageMapper.delete(id);
    }
}
