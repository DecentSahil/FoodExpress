package com.cart.cart_service.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CartResponse(
        UUID cartId,
        UUID userId,
        UUID restaurantId,
        LocalDateTime createdAt,
        List<CartItemResponse> items
) {}
