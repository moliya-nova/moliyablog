package com.bloger.backend.mapper;

import com.bloger.backend.entity.SiteSettings;

public interface SiteSettingsMapper {
    SiteSettings selectByKey(String key);
    int insert(SiteSettings siteSettings);
    int update(SiteSettings siteSettings);
}
