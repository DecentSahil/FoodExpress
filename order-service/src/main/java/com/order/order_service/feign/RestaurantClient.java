package com.order.order_service.feign;

import com.order.order_service.dto.OrderItemRequest;
import com.order.order_service.dto.OrderValidationRequest;
import com.order.order_service.dto.OrderValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "RESTAURANT-SERVICE")
public interface RestaurantClient {

    @PostMapping("/restaurant/order-details")
    OrderValidationResponse validateOrder(
            @RequestBody OrderValidationRequest request
    );

    @GetMapping("/restaurant/{id}/exists")
    Boolean checkExists(@PathVariable UUID id);

    @PostMapping("restaurant/menu/price")
    Double calculateTotal(@RequestBody List<OrderItemRequest> items);

    @GetMapping("/restaurant/menu/{id}/price")
    Double getItemPrice(@PathVariable("id") UUID id);

}
