package com.restaurant.restaurant_service.dto;


import com.restaurant.restaurant_service.entity.Status;

import java.util.UUID;


public record RestaurantResponse(
        UUID id,
        String name,
        String email,
        String address,
        String cuisineType,
        boolean isActive,
        Status status
) {}