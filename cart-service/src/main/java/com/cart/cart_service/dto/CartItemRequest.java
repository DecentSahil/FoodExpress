package com.cart.cart_service.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import org.springframework.beans.factory.annotation.Value;

import java.util.UUID;

public record CartItemRequest(

        @NotNull(message = "RestaurantId cannot be null")
        UUID restaurantId,
        @NotNull(message = "MenuItemId cannot be null")
        UUID menuItemId,
        @Min(value = 1, message = "Quantity must be at least 1")
        int quantity
) {
}
