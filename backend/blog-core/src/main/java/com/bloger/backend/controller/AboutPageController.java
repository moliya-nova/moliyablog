package com.bloger.backend.controller;

import com.bloger.backend.entity.AboutPage;
import com.bloger.backend.service.AboutPageService;
import com.bloger.backend.util.ImagePathValidator;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/about-page")
public class AboutPageController {

    @Autowired
    private AboutPageService aboutPageService;

    @Autowired
    private ImagePathValidator imagePathValidator;

    @Autowired
    private ObjectMapper objectMapper;

    @GetMapping
    public AboutPage get() {
        return aboutPageService.getById(1L);
    }

    @PutMapping
    public void update(@RequestBody AboutPage aboutPage) throws Exception {
        String profile = aboutPage.getProfile();
        if (profile != null && !profile.isEmpty()) {
            JsonNode profileJson = objectMapper.readTree(profile);
            if (profileJson.has("avatar")) {
                String avatar = profileJson.get("avatar").asText();
                imagePathValidator.validateAvatarPath(avatar);
            }
        }
        aboutPage.setId(1L);
        aboutPageService.save(aboutPage);
    }
}
