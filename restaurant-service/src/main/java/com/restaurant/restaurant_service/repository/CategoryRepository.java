package com.restaurant.restaurant_service.repository;

import com.restaurant.restaurant_service.dto.CategoryResponse;
import com.restaurant.restaurant_service.entity.MenuCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<MenuCategory,UUID> {
    Optional<MenuCategory> findById(UUID id);
    List<MenuCategory> findByRestaurantId(UUID restaurantId);
    boolean existsByRestaurantIdAndCategoryName(UUID restaurantId, String categoryName);

//    List<MenuCategory> findAll();
}
