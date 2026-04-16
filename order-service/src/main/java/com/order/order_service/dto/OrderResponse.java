package com.order.order_service.dto;

import com.order.order_service.entity.Order;
import com.order.order_service.entity.OrderStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class OrderResponse {

    private UUID orderId;
    private UUID restaurantId;
    private Double totalAmount;
    private OrderStatus status;
    private LocalDateTime createdAt;


}
