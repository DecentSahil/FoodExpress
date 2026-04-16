package com.order.order_service.service;

import com.order.order_service.dto.*;
import com.order.order_service.entity.Order;
import com.order.order_service.entity.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request);

//    OrderDetails getOrderDetails(UUID orderId, UUID userId);

    List<UserOrderResponse> getOrdersByUser(UUID userId);

    OrderDetailsResponse getOrderDetails(UUID orderId);

    List<RestaurantOrderResponse> getOrdersByRestaurant(UUID restaurantId);

    void updateStatus(UUID OrderId,String status);
//    void cancelOrder(UUID orderId, UUID userId);
}
