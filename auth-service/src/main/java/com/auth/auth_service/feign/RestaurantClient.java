package com.auth.auth_service.feign;

import com.auth.auth_service.dto.RestaurantValidationResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "RESTAURANT-SERVICE")
public interface RestaurantClient {

    @GetMapping("/restaurant/internal/validate")
    RestaurantValidationResponse validateRestaurant(@RequestParam String email);
}
