package com.restaurant.restaurant_service.dto;

import jakarta.validation.constraints.*;

public record CategoryRequest(

        @NotBlank(message = "Category name cannot be blank")
        @Size(min = 2, max = 50, message = "Category name must be between 2 and 50 characters")
        String categoryName

) {}