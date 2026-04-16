package com.restaurant.restaurant_service.dto;


import org.springframework.web.multipart.MultipartFile;

public record RestaurantRequest(String name, String email, String description, String cuisineType, String address, MultipartFile image) {}

