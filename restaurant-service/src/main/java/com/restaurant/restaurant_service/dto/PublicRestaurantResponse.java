package com.restaurant.restaurant_service.dto;


import java.util.UUID;

public record PublicRestaurantResponse(
        UUID id,
        String name,
        String address,
        String imageUrl

) {
}
