package com.restaurant.restaurant_service.service;

import com.restaurant.restaurant_service.dto.MenuItemResponse;
import com.restaurant.restaurant_service.dto.MenuItemRequest;
import com.restaurant.restaurant_service.dto.OrderItemDto;
import jakarta.transaction.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface MenuItemService {

    @Transactional
    MenuItemResponse createMenuItem(UUID restaurantId, MenuItemRequest request);

    String saveImage(MultipartFile file);

    List<MenuItemResponse> getMyMenu(UUID restaurantId);

    List<MenuItemResponse> getMenuByCategory(UUID restaurantId, UUID categoryId);

    List<MenuItemResponse> getAllAvailableMenuItems();

    @Transactional
    void updateAvailability(UUID id, boolean available);

    @Transactional
    void deleteProduct(UUID restaurantId, UUID id);

    MenuItemResponse updateProduct(UUID restaurantId, UUID productId, MenuItemRequest request);

    void reIndexAll();

    void deleteAllFromElasticsearch();

    double calculateTotal(List<OrderItemDto> items);

    Double getItemPrice(UUID id);
}
