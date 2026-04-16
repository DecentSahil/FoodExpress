package com.restaurant.restaurant_service.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;

public record MenuSearchRequest(

        String search,

        Boolean veg,

        @PositiveOrZero(message = "Minimum price cannot be negative")
        Double minPrice,

        @PositiveOrZero(message = "Maximum price cannot be negative")
        Double maxPrice,

        String categoryId,

        @PositiveOrZero(message = "Page must be 0 or greater")
        int page,

        @Positive(message = "Size must be greater than 0")
        int size

) {}