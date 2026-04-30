package com.bloger.backend.service;

import com.bloger.backend.entity.CarouselSlide;
import java.util.List;

public interface CarouselSlideService {
    List<CarouselSlide> getAll();
    CarouselSlide getById(Long id);
    void create(CarouselSlide carouselSlide);
    void update(CarouselSlide carouselSlide);
    void delete(Long id);
}
