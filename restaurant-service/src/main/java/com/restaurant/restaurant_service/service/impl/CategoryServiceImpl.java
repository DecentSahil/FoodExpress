package com.restaurant.restaurant_service.service.impl;

import com.restaurant.restaurant_service.dto.CategoryResponse;
import com.restaurant.restaurant_service.entity.MenuCategory;
import com.restaurant.restaurant_service.entity.Restaurant;
import com.restaurant.restaurant_service.entity.Status;
import com.restaurant.restaurant_service.repository.CategoryRepository;
import com.restaurant.restaurant_service.repository.RestaurantRepository;
import com.restaurant.restaurant_service.service.CategoryService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final RestaurantRepository restaurantRepository;



    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(cat -> new CategoryResponse(cat.getId(),cat.getCategoryName()))
                .toList();
    }

    @Transactional
    @Override
    public CategoryResponse createCategory(UUID restaurantId, String categoryName) {

        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        if (!restaurant.isActive() || restaurant.getStatus() != Status.APPROVED) {
            throw new RuntimeException("Restaurant not approved");
        }

        if (categoryRepository.existsByRestaurantIdAndCategoryName(restaurantId, categoryName)) {
            throw new RuntimeException("Category already exists");
        }

        MenuCategory category = new MenuCategory();
        category.setCategoryName(categoryName);
        category.setRestaurant(restaurant);

        MenuCategory saved = categoryRepository.save(category);

        return new CategoryResponse(saved.getId(), saved.getCategoryName());
    }

    @Override
    public List<CategoryResponse> getMyCategories(UUID restaurantId) {
        return categoryRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(c -> new CategoryResponse(c.getId(), c.getCategoryName()))
                .toList();
    }


    @Transactional
    @Override
    public void deleteCategory(UUID categoryId, UUID restaurantId) {

        MenuCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized access");
        }

        categoryRepository.delete(category);
    }


    @Transactional
    @Override
    public CategoryResponse updateCategory(UUID categoryId, UUID restaurantId, String newName) {

        MenuCategory category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found"));

        // 🔐 Ownership check
        if (!category.getRestaurant().getId().equals(restaurantId)) {
            throw new RuntimeException("Unauthorized access");
        }

        // Optional: prevent duplicate names
        if (categoryRepository.existsByRestaurantIdAndCategoryName(restaurantId, newName)) {
            throw new RuntimeException("Category with same name already exists");
        }

        category.setCategoryName(newName);
        MenuCategory updated = categoryRepository.save(category);

        return new CategoryResponse(updated.getId(), updated.getCategoryName());
    }



}
