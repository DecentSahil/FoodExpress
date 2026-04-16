package com.order.order_service.dto;


import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.List;
import java.util.UUID;

public record CreateOrderRequest(

        @NotNull(message = "UserId cannot be null")
        UUID userId,

        @Email(message = "Invalid email")
        @NotBlank(message = "Email cannot be empty")
        String userEmail,

        @NotNull(message = "RestaurantId cannot be null")
        UUID restaurantId,

        @NotEmpty(message = "Items cannot be empty")
        List<@Valid OrderItemRequest> items
) {}