package com.restaurant.restaurant_service.service;

import com.restaurant.restaurant_service.dto.CategoryResponse;
import com.restaurant.restaurant_service.entity.MenuCategory;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.UUID;

public interface CategoryService {

    List<CategoryResponse> getAllCategories();

    @Transactional
    CategoryResponse createCategory(UUID restaurantId, String categoryName);

    List<CategoryResponse> getMyCategories(UUID restaurantId);

    @Transactional
    void deleteCategory(UUID categoryId, UUID restaurantId);


    @Transactional
    CategoryResponse updateCategory(UUID categoryId, UUID restaurantId, String newName);
}
