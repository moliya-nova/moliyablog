package com.bloger.backend.service.impl;

import com.bloger.backend.entity.CarouselSlide;
import com.bloger.backend.mapper.CarouselSlideMapper;
import com.bloger.backend.service.CarouselSlideService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CarouselSlideServiceImpl implements CarouselSlideService {

    @Autowired
    private CarouselSlideMapper carouselSlideMapper;

    @Override
    public List<CarouselSlide> getAll() {
        return carouselSlideMapper.selectAll();
    }

    @Override
    public CarouselSlide getById(Long id) {
        return carouselSlideMapper.selectById(id);
    }

    @Override
    public void create(CarouselSlide carouselSlide) {
        carouselSlideMapper.insert(carouselSlide);
    }

    @Override
    public void update(CarouselSlide carouselSlide) {
        carouselSlideMapper.update(carouselSlide);
    }

    @Override
    public void delete(Long id) {
        carouselSlideMapper.deleteById(id);
    }
}
