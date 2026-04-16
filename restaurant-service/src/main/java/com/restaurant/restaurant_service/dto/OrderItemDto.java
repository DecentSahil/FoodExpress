package com.restaurant.restaurant_service.dto;


import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class OrderItemDto {
    private UUID menuItemId;
    private Integer quantity;
}
