package com.bloger.backend.service;

import com.bloger.backend.entity.SiteSettings;

public interface SiteSettingsService {
    SiteSettings getByKey(String key);
    void save(String key, String value);
}
