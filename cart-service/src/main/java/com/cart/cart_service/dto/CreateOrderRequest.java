package com.cart.cart_service.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(

        @NotNull(message = "UserId cannot be null")
        UUID userId,

        @NotBlank(message = "Invalid email")
        String userEmail,

        @NotNull(message = "RestaurantId cannot be null")
        UUID restaurantId,

        @NotEmpty(message = "Items cannot be empty")
        List<OrderItemRequest> items
) {}