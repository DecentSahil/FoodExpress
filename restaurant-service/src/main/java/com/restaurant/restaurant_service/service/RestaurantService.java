package com.restaurant.restaurant_service.service;

import com.restaurant.restaurant_service.dto.PublicRestaurantResponse;
import com.restaurant.restaurant_service.dto.RestaurantRequest;
import com.restaurant.restaurant_service.dto.RestaurantResponse;
import com.restaurant.restaurant_service.dto.RestaurantValidationResponse;
import com.restaurant.restaurant_service.dto.orderfeign.OrderValidationRequest;
import com.restaurant.restaurant_service.dto.orderfeign.OrderValidationResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface RestaurantService {

     RestaurantResponse createRestaurant(RestaurantRequest request);

     RestaurantResponse approveRestaurant(UUID id);

     List<RestaurantResponse> getAllRestaurants();

     List<PublicRestaurantResponse> getAllPublicRestaurants();

     void deleteRestaurant(UUID id);

     RestaurantValidationResponse validateRestaurant(String email);

     boolean checkExists(UUID restaurantId);

     String saveImage(MultipartFile file);

     OrderValidationResponse validateOrder(OrderValidationRequest request);

    void updatePhoto(String restaurantId,MultipartFile image);
}
