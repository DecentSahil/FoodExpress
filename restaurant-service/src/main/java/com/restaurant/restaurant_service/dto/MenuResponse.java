package com.restaurant.restaurant_service.dto;


import java.util.UUID;

public record MenuResponse(
        UUID id,
        String name,
        String productImage,
        Double price
) {
}
