package com.bloger.backend.controller;

import com.bloger.backend.entity.SiteSettings;
import com.bloger.backend.service.SiteSettingsService;
import com.bloger.backend.util.ImagePathValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/site-settings")
public class SiteSettingsController {

    @Autowired
    private SiteSettingsService siteSettingsService;

    @Autowired
    private ImagePathValidator imagePathValidator;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping("/{key}")
    public String getByKey(@PathVariable String key) {
        SiteSettings siteSettings = siteSettingsService.getByKey(key);
        return siteSettings != null ? siteSettings.getValue() : "";
    }

    @PutMapping("/{key}")
    public void save(@PathVariable String key, @RequestBody String value) throws Exception {
        if ("background".equals(key) && value != null && !value.isEmpty()) {
            JsonNode valueJson = objectMapper.readTree(value);
            if (valueJson.has("imageUrl")) {
                String imageUrl = valueJson.get("imageUrl").asText();
                imagePathValidator.validateImagePath(imageUrl);
            }
        }
        siteSettingsService.save(key, value);
    }
}
