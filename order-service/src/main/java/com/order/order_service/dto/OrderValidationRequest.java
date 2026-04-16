package com.order.order_service.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderValidationRequest {

    @NotNull(message = "Restaurant Id cannot be null")
    private UUID restaurantId;

    @NotEmpty(message = "Items cannot be empty")
    private List<OrderItemRequest> items;
}