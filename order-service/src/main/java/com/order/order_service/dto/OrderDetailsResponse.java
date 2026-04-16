package com.order.order_service.dto;


import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
public class OrderDetailsResponse {


    private UUID orderId;
    private String restaurantName;
    private UUID restaurantId;
    @NotEmpty
    private List<OrderItemResponse> items;

}
