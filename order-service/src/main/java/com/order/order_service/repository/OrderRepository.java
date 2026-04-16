package com.order.order_service.repository;

import com.order.order_service.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;


public interface OrderRepository extends JpaRepository<Order, UUID> {

    List<Order> findByUserId(UUID userId);
    List<Order> findByRestaurantId(UUID restaurantId);
}
