package com.restaurant.restaurant_service.repository;

import com.restaurant.restaurant_service.entity.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface RestaurantRepository extends JpaRepository<Restaurant,UUID> {
    Optional<Restaurant> findById(UUID id);
    Optional<Restaurant> findByEmail(String email);
    boolean existsByEmail(String email);
    List<Restaurant> findByIsActiveTrue();
}
