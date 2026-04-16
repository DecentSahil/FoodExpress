package com.cart.cart_service.feign;


import com.cart.cart_service.dto.CreateOrderRequest;
import com.cart.cart_service.dto.OrderResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;

import java.util.UUID;

@FeignClient(name = "ORDER-SERVICE")
public interface OrderClient {

    @PostMapping("/orders")
    OrderResponse createOrder(
            @RequestBody CreateOrderRequest request
    );
}
