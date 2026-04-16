package com.restaurant.restaurant_service.controller;


import com.restaurant.restaurant_service.dto.PublicRestaurantResponse;
import com.restaurant.restaurant_service.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("restaurant/public")
@RequiredArgsConstructor
public class PublicRestaurantController {

    private final RestaurantService restaurantService;

    @GetMapping
    public ResponseEntity<List<PublicRestaurantResponse>> getAllPublicRestaurant(){
        return ResponseEntity.ok(restaurantService.getAllPublicRestaurants());
    }
}
