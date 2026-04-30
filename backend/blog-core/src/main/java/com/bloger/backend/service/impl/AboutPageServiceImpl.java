package com.bloger.backend.service.impl;

import com.bloger.backend.entity.AboutPage;
import com.bloger.backend.mapper.AboutPageMapper;
import com.bloger.backend.service.AboutPageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AboutPageServiceImpl implements AboutPageService {

    @Autowired
    private AboutPageMapper aboutPageMapper;

    @Override
    public AboutPage getById(Long id) {
        return aboutPageMapper.selectById(id);
    }

    @Override
    public void save(AboutPage aboutPage) {
        AboutPage existing = aboutPageMapper.selectById(aboutPage.getId());
        if (existing != null) {
            aboutPageMapper.update(aboutPage);
        } else {
            aboutPageMapper.insert(aboutPage);
        }
    }
}
