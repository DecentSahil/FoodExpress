package com.cart.cart_service.feign;


import com.cart.cart_service.dto.MenuItemResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;
import java.util.UUID;

@FeignClient(name = "RESTAURANT-SERVICE")
public interface RestaurantClient {

    @PostMapping("/menu/items/details")
    List<MenuItemResponse> getMenuItemsByIds(
            @RequestBody List<UUID> menuItemIds
    );
}
