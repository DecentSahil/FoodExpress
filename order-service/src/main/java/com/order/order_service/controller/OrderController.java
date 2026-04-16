package com.order.order_service.controller;

import com.order.order_service.dto.*;
import com.order.order_service.exception.AccessDeniedException;
import com.order.order_service.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    // ✅ Get orders of logged-in user
    @GetMapping("/users")
    public ResponseEntity<List<UserOrderResponse>> getMyOrders(
            @RequestHeader("X-Auth-User-Id") @NotNull(message = "UserId cannot be null") UUID userId
    ) {
        return ResponseEntity.ok(orderService.getOrdersByUser(userId));
    }

    // ✅ Create new order
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            @RequestBody @Valid CreateOrderRequest request
    ) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ✅ Get restaurant orders (only restaurant role)
    @GetMapping("/restaurant")
    public ResponseEntity<List<RestaurantOrderResponse>> getOrdersByRestaurant(
            @RequestHeader("X-Restaurant-Id") @NotNull(message = "RestaurantId cannot be null") UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank(message = "Role cannot be empty") String role
    ) {
        if (!"ROLE_RESTAURANT".equals(role)) {
            throw new AccessDeniedException("Invalid request, must be restaurant owner");
        }

        return ResponseEntity.ok(orderService.getOrdersByRestaurant(restaurantId));
    }

    // ✅ Update order status
    @PatchMapping("/restaurant/{orderId}/status")
    public ResponseEntity<Void> updateStatus(
            @PathVariable @NotNull(message = "OrderId cannot be null") UUID orderId,
            @RequestBody @Valid UpdateOrderStatusRequest request
    ) {
        orderService.updateStatus(orderId, request.getStatus());
        return ResponseEntity.ok().build();
    }
}