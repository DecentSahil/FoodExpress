package com.cart.cart_service.service.impl;

import com.cart.cart_service.dto.*;
import com.cart.cart_service.entity.Cart;
import com.cart.cart_service.entity.CartItem;
import com.cart.cart_service.exception.ResourceNotFoundException;
import com.cart.cart_service.feign.OrderClient;
import com.cart.cart_service.feign.RestaurantClient;
import com.cart.cart_service.repository.CartItemRepository;
import com.cart.cart_service.repository.CartRepository;
import com.cart.cart_service.service.CartService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartServiceImpl implements CartService {

        private final CartRepository cartRepository;
        private final CartItemRepository cartItemRepository;
        private final OrderClient orderClient;
        private final RestaurantClient restaurantClient;

        @Override
        @Transactional
        public void addItem(UUID userId, CartItemRequest cartItemRequest) {



                if (cartItemRequest.quantity() <= 0) {
                        throw new IllegalArgumentException("Quantity must be greater than 0");
                }

                Cart cart = cartRepository.findByUserId(userId)
                        .orElseGet(() -> {
                                Cart newCart = new Cart();
                                newCart.setUserId(userId);
                                newCart.setRestaurantId(cartItemRequest.restaurantId());
                                newCart.setItems(new ArrayList<>());
                                return cartRepository.save(newCart);
                        });

                if (cart.getRestaurantId() == null || cart.getItems().isEmpty()) {
                        cart.setRestaurantId(cartItemRequest.restaurantId());
                }
                else if (!cart.getRestaurantId().equals(cartItemRequest.restaurantId())) {
                        throw new IllegalStateException(
                                "You can only add items from one restaurant at a time");
                }

                Optional<CartItem> existingItem = cart.getItems()
                        .stream()
                        .filter(item -> item.getMenuItemId().equals(cartItemRequest.menuItemId()))
                        .findFirst();

                if (existingItem.isPresent()) {
                        CartItem item = existingItem.get();
                        item.setQuantity(item.getQuantity() + cartItemRequest.quantity());
                } else {
                        CartItem item = new CartItem();
                        item.setMenuItemId(cartItemRequest.menuItemId());
                        item.setQuantity(cartItemRequest.quantity());
                        item.setCart(cart);
                        cart.getItems().add(item);
                }

                cartRepository.save(cart);
        }

        @Override
        public void removeItem(UUID userId, UUID cartItemId) {

                Cart cart = cartRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                cart.getItems().removeIf(item -> item.getId().equals(cartItemId));

                cartRepository.save(cart);
        }

        @Override
        public void clearCart(UUID userId) {

                Cart cart = cartRepository.findByUserId(userId)
                                .orElseThrow(() -> new RuntimeException("Cart not found"));

                cart.getItems().clear();

                cartRepository.save(cart);
        }

        @Transactional
        @Override
        public OrderResponse checkout(String userEmail,UUID userId) {

                Cart cart = cartRepository.findByUserId(userId)
                                .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));


                if (cart.getItems().isEmpty()) {
                        throw new IllegalStateException("Cart is empty");
                }

                List<OrderItemRequest> orderItems = cart.getItems()
                                .stream()
                                .map(item -> new OrderItemRequest(
                                                item.getMenuItemId(),
                                                item.getQuantity()))
                                .toList();

                CreateOrderRequest request = new CreateOrderRequest(
                                userId,
                                userEmail,
                                cart.getRestaurantId(),
                                orderItems);

                OrderResponse orderResponse = orderClient.createOrder(request);

                cart.getItems().clear();
                cartRepository.save(cart);


                return orderResponse;
        }

        @Override
        @Transactional()
        public CartResponse getCart(UUID userId) {

                Cart cart = cartRepository.findByUserId(userId)
                        .orElseThrow(() -> new ResourceNotFoundException("Cart not found"));

                List<UUID> menuItemIds = cart.getItems()
                        .stream()
                        .map(CartItem::getMenuItemId)
                        .toList();

                List<MenuItemResponse> menuItems =
                        restaurantClient.getMenuItemsByIds(menuItemIds);

                Map<UUID, MenuItemResponse> menuItemMap = menuItems.stream()
                        .collect(Collectors.toMap(MenuItemResponse::id, m -> m));

                List<CartItemResponse> items = cart.getItems()
                        .stream()
                        .map(item -> {

                                MenuItemResponse menu = menuItemMap.get(item.getMenuItemId());

                                if (menu == null) {
                                        cartItemRepository.delete(item);
                                        return null;
                                }

                                return new CartItemResponse(
                                        item.getId(),
                                        item.getMenuItemId(),
                                        menu.name(),
                                        menu.price(),
                                        menu.productImage(),
                                        item.getQuantity()
                                );
                        })
                        .filter(Objects::nonNull)
                        .toList();

                return new CartResponse(
                        cart.getId(),
                        cart.getUserId(),
                        cart.getRestaurantId(),
                        cart.getCreatedAt(),
                        items
                );
        }
        private CartPriceResponse cartValue(){
                return null;
        }



}
