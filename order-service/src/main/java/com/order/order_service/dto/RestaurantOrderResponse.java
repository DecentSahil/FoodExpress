package com.order.order_service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantOrderResponse {

    private UUID orderId;
    private UUID userId;
    private List<OrderItemResponse> items;
    private double totalPrice;
    private String status;

}