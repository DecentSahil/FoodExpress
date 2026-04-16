package com.restaurant.restaurant_service.dto;


import com.restaurant.restaurant_service.entity.Status;

import java.util.UUID;

public record RestaurantValidationResponse(
        UUID id,
        String email,
        boolean isActive,
        Status status
) {}
