package com.restaurant.restaurant_service.service.impl;

import com.restaurant.restaurant_service.dto.MenuItemResponse;
import com.restaurant.restaurant_service.entity.*;
import com.restaurant.restaurant_service.dto.MenuItemRequest;
import com.restaurant.restaurant_service.dto.OrderItemDto;
import com.restaurant.restaurant_service.repository.CategoryRepository;
import com.restaurant.restaurant_service.repository.MenuItemRepository;
import com.restaurant.restaurant_service.repository.RestaurantRepository;
import com.restaurant.restaurant_service.service.MenuItemService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.elasticsearch.core.ElasticsearchOperations;
import org.springframework.data.elasticsearch.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemImpl implements MenuItemService {

    private final MenuItemRepository menuItemRepository;
    private final RestaurantRepository restaurantRepository;
    private final CategoryRepository categoryRepository;
    private final ElasticsearchOperations elasticsearchOperations;
    private final String uploadDir = "uploads/products";

    @Transactional
    @Override
    public MenuItemResponse createMenuItem(UUID restaurantId, MenuItemRequest request) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!restaurant.isActive() || restaurant.getStatus() != Status.APPROVED) {
            throw new RuntimeException("Restaurant not approved");
        }

        MenuCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Category does not belong to this restaurant");
        }

        MenuItem item = new MenuItem();
        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setVeg(request.veg());
        item.setCategory(category);
        item.setRestaurant(restaurant);
        if (request.productImage() != null && !request.productImage().isEmpty()) {
            String fileName = saveImage(request.productImage());
            item.setProductImage(fileName);
        }
        MenuItem saved = menuItemRepository.save(item);

        MenuItemDocument doc = new MenuItemDocument(
                saved.getId().toString(),
                saved.getName(),
                saved.getDescription(),
                saved.getPrice(),
                saved.isVeg(),
                saved.isAvailable(),
                saved.getRestaurant().getId().toString(),
                saved.getCategory().getId().toString(),
                saved.getProductImage(),
                saved.getRestaurant().getName(),
                saved.getCategory().getCategoryName());

        try {
            elasticsearchOperations.save(doc);
        } catch (Exception e) {
            throw new RuntimeException("Search Indexing Failed: " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    public MenuItemResponse updateProduct(UUID restaurantId, UUID productId, MenuItemRequest request) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!restaurant.isActive() || restaurant.getStatus() != Status.APPROVED) {
            throw new RuntimeException("Restaurant not approved");
        }

        MenuCategory category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Category does not belong to this restaurant");
        }

        MenuItem item = menuItemRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!item.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Item does not belong to this restaurant");
        }
        item.setName(request.name());
        item.setDescription(request.description());
        item.setPrice(request.price());
        item.setVeg(request.veg());
        item.setCategory(category);
        if (request.productImage() != null && !request.productImage().isEmpty()) {
            String fileName = saveImage(request.productImage());
            item.setProductImage(fileName);
        }
        MenuItem saved = menuItemRepository.save(item);

        MenuItemDocument doc = new MenuItemDocument(
                saved.getId().toString(),
                saved.getName(),
                saved.getDescription(),
                saved.getPrice(),
                saved.isVeg(),
                saved.isAvailable(),
                saved.getRestaurant().getId().toString(),
                saved.getCategory().getId().toString(),
                saved.getProductImage(),
                saved.getRestaurant().getName(),
                saved.getCategory().getCategoryName());

        try {
            elasticsearchOperations.save(doc);
        } catch (Exception e) {
            throw new RuntimeException("Search Indexing Failed: " + e.getMessage());
        }

        return mapToResponse(saved);

    }

    @Override
    public String saveImage(MultipartFile file) {

        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), filePath);

            return fileName;

        } catch (IOException e) {
            throw new RuntimeException("Image upload failed");
        }
    }

    @Override
    public List<MenuItemResponse> getMyMenu(UUID restaurantId) {
        return menuItemRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<MenuItemResponse> getMenuByCategory(UUID restaurantId, UUID categoryId) {
        return menuItemRepository.findByRestaurantIdAndCategoryId(restaurantId, categoryId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private MenuItemResponse mapToResponse(MenuItem item) {
        return new MenuItemResponse(
                item.getId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isVeg(),
                item.isAvailable(),
                item.getProductImage(),
                item.getCategory().getCategoryName().toString());
    }

    @Override
    public List<MenuItemResponse> getAllAvailableMenuItems() {

        return menuItemRepository.findByAvailableTrue()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    @Override
    public void updateAvailability(UUID id, boolean available) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        item.setAvailable(available);

        MenuItemDocument doc = new MenuItemDocument(
                item.getId().toString(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isVeg(),
                item.isAvailable(),
                item.getRestaurant().getId().toString(),
                item.getCategory().getId().toString(),
                item.getProductImage(),
                item.getRestaurant().getName(),
                item.getCategory().getCategoryName()
        );

        elasticsearchOperations.save(doc);
    }

    @Transactional
    @Override
    public void deleteProduct(UUID restaurantId, UUID id) {

        MenuItem item = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found"));

        if (!item.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("You are not allowed to delete this item");
        }

        menuItemRepository.delete(item);

        elasticsearchOperations.delete(id.toString(), MenuItemDocument.class);
    }

    @Override
    public void reIndexAll() {
        List<MenuItem> allItems = menuItemRepository.findAll();
        for (MenuItem item : allItems) {
            MenuItemDocument doc = new MenuItemDocument(
                    item.getId().toString(),
                    item.getName(),
                    item.getDescription(),
                    item.getPrice(),
                    item.isVeg(),
                    item.isAvailable(),
                    item.getRestaurant().getId().toString(),
                    item.getCategory().getId().toString(),
                    item.getProductImage(),
                    item.getRestaurant().getName(),
                    item.getCategory().getCategoryName());
            elasticsearchOperations.save(doc);
        }
    }

    @Override
    public void deleteAllFromElasticsearch() {
        elasticsearchOperations.delete(Query.findAll(), MenuItemDocument.class);
    }

    @Override
    public double calculateTotal(List<OrderItemDto> items) {
        return items.stream()
                .mapToDouble(orderItem -> {
                    MenuItem menuItem = menuItemRepository.findById(orderItem.getMenuItemId())
                            .orElseThrow(
                                    () -> new RuntimeException("Menu item not found: " + orderItem.getMenuItemId()));
                    return menuItem.getPrice().doubleValue() * orderItem.getQuantity();
                })
                .sum();
    }

    @Override
    public Double getItemPrice(UUID id) {
        MenuItem menuItem = menuItemRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Menu item not found: " + id));
        return menuItem.getPrice().doubleValue();
    }

}
