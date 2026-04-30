package com.bloger.backend.mapper;

import com.bloger.backend.entity.CarouselSlide;
import java.util.List;

public interface CarouselSlideMapper {
    List<CarouselSlide> selectAll();
    CarouselSlide selectById(Long id);
    int insert(CarouselSlide carouselSlide);
    int update(CarouselSlide carouselSlide);
    int deleteById(Long id);
}
