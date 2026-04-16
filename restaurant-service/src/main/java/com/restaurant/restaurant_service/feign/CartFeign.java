package com.restaurant.restaurant_service.feign;

import com.restaurant.restaurant_service.dto.MenuResponse;
import com.restaurant.restaurant_service.repository.MenuItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
public class CartFeign {
    private final MenuItemRepository menuItemRepository;
    @PostMapping("/menu/items/details")
    public List<MenuResponse> getMenuItemsByIds(
            @RequestBody List<UUID> ids
    ) {
        return menuItemRepository.findAllById(ids)
                .stream()
                .map(item -> new MenuResponse(
                        item.getId(),
                        item.getName(),
                        item.getProductImage(),
                        item.getPrice()

                ))
                .toList();
    }

}
