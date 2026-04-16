package com.order.order_service.dto;

import java.util.UUID;

public record OrderItemResponse(
        UUID menuItemId,
        String productName,
        Integer quantity,
        Double price
) {
}
