package com.restaurant.restaurant_service.dto;

import java.util.UUID;

public record MenuItemResponse(
        UUID id,
        String name,
        String description,
        Double price,
        boolean isVeg,
        boolean isAvailable,
        String productImage,
        String category
) {}

