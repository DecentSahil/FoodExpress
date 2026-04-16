package com.cart.cart_service.controller;

import com.cart.cart_service.dto.CartItemRequest;
import com.cart.cart_service.dto.CartResponse;
import com.cart.cart_service.dto.OrderResponse;
import com.cart.cart_service.service.CartService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;
@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;


    @PostMapping("/add")
    public void addToCart(
            @RequestHeader("X-Auth-User-Id") @NotNull(message = "UserId cannot be null") UUID userId,
            @RequestBody @Valid CartItemRequest cartItem
            ) {
        cartService.addItem(userId, cartItem);
    }


    @DeleteMapping("/clear")
    public void clearCart(
            @RequestHeader("X-Auth-User-Id") @NotNull(message = "UserId cannot be null") UUID userId
    ) {
        cartService.clearCart(userId);
    }



    @DeleteMapping("/remove/{cartItemId}")
    public void removeFromCart(
            @RequestHeader("X-Auth-User-Id") UUID userId,
            @PathVariable @NotNull(message = "CartItemId cannot be null") UUID cartItemId
    ) {
        cartService.removeItem(userId, cartItemId);
    }

    @GetMapping
    public CartResponse getCart(
            @RequestHeader("X-Auth-User-Id") UUID userId
    ) {
        return cartService.getCart(userId);
    }

    @PostMapping("/checkout")
    public OrderResponse checkout(
            @RequestHeader("X-Auth-User-Id") UUID userId,
            @RequestHeader("X-User-Email") @NotBlank String userEmail
    ) {
        return cartService.checkout(userEmail, userId);
    }


}
