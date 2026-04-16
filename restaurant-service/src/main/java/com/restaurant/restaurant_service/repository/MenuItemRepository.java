package com.restaurant.restaurant_service.repository;

import com.restaurant.restaurant_service.entity.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MenuItemRepository extends JpaRepository<MenuItem, UUID> {

    List<MenuItem> findByRestaurantId(UUID restaurantId);

    List<MenuItem> findByRestaurantIdAndCategoryId(UUID restaurantId, UUID categoryId);
    List<MenuItem> findByAvailableTrue();}

