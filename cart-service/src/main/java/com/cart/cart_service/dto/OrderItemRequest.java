package com.cart.cart_service.dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;
public record OrderItemRequest(

        @NotNull(message = "Please provide product id")
        UUID menuItemId,

        @NotNull(message = "Quantity cannot be null")
        @Min(value = 1, message = "Quantity must be at least 1")
        Integer quantity
) {}