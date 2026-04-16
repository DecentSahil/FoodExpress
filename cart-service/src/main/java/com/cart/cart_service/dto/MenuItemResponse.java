package com.cart.cart_service.dto;


import java.util.UUID;

public record MenuItemResponse(
        UUID id,
        String name,
        String productImage,
        Double price
) {}
