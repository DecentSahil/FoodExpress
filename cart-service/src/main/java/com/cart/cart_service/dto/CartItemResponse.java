package com.cart.cart_service.dto;

import java.util.UUID;

public record CartItemResponse(
        UUID cartItemId,
        UUID menuItemId,
        String name,
        Double price,
        String productImage,
        Integer quantity
) {}
