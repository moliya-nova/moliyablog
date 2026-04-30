package com.bloger.backend.service.impl;

import com.bloger.backend.entity.SiteSettings;
import com.bloger.backend.mapper.SiteSettingsMapper;
import com.bloger.backend.service.SiteSettingsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SiteSettingsServiceImpl implements SiteSettingsService {

    @Autowired
    private SiteSettingsMapper siteSettingsMapper;

    @Override
    public SiteSettings getByKey(String key) {
        return siteSettingsMapper.selectByKey(key);
    }

    @Override
    public void save(String key, String value) {
        SiteSettings existing = siteSettingsMapper.selectByKey(key);
        if (existing != null) {
            existing.setValue(value);
            siteSettingsMapper.update(existing);
        } else {
            SiteSettings siteSettings = new SiteSettings();
            siteSettings.setKey(key);
            siteSettings.setValue(value);
            siteSettingsMapper.insert(siteSettings);
        }
    }
}
