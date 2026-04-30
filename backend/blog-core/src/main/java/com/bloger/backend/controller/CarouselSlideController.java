package com.bloger.backend.controller;

import com.bloger.backend.entity.CarouselSlide;
import com.bloger.backend.service.CarouselSlideService;
import com.bloger.backend.util.ImagePathValidator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/carousel-slides")
public class CarouselSlideController {

    @Autowired
    private CarouselSlideService carouselSlideService;

    @Autowired
    private ImagePathValidator imagePathValidator;

    @GetMapping
    public List<CarouselSlide> getAll() {
        return carouselSlideService.getAll();
    }

    @PostMapping
    public void create(@RequestBody CarouselSlide carouselSlide) {
        imagePathValidator.validateImagePath(carouselSlide.getImageUrl());
        carouselSlideService.create(carouselSlide);
    }

    @PutMapping("/{id}")
    public void update(@PathVariable Long id, @RequestBody CarouselSlide carouselSlide) {
        imagePathValidator.validateImagePath(carouselSlide.getImageUrl());
        carouselSlide.setId(id);
        carouselSlideService.update(carouselSlide);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        carouselSlideService.delete(id);
    }
}
