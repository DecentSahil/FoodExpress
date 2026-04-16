package com.cart.cart_service.service;

import com.cart.cart_service.dto.CartItemRequest;
import com.cart.cart_service.dto.CartResponse;
import com.cart.cart_service.dto.OrderResponse;
import jakarta.transaction.Transactional;

import java.util.UUID;


public interface CartService {

    @Transactional
    public void addItem(UUID userId,
                        CartItemRequest cartItem);

    void removeItem(UUID userId, UUID cartItemId);

    void clearCart(UUID userId);

    OrderResponse checkout(String userEmail,UUID userId);

    CartResponse getCart(UUID userId);

}
