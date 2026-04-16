package com.restaurant.restaurant_service.controller;

import com.restaurant.restaurant_service.dto.MenuItemRequest;
import com.restaurant.restaurant_service.dto.MenuItemResponse;
import com.restaurant.restaurant_service.dto.OrderItemDto;
import com.restaurant.restaurant_service.exception.AccessDeniedException;
import com.restaurant.restaurant_service.service.MenuItemService;
import com.restaurant.restaurant_service.service.SearchSyncService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/restaurant/menu")
public class MenuController {

    private final MenuItemService menuItemService;
    private final SearchSyncService searchSyncService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MenuItemResponse> createMenuItem(
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role,
            @ModelAttribute @Valid MenuItemRequest request) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            throw new AccessDeniedException("Not Authorized");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(menuItemService.createMenuItem(restaurantId, request));
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> getMyMenu(
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            throw new AccessDeniedException("Not Authorized");
        }

        return ResponseEntity.ok(menuItemService.getMyMenu(restaurantId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MenuItemResponse> updateMenu(
            @PathVariable @NotNull UUID id,
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role,
            @ModelAttribute @Valid MenuItemRequest request) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            throw new AccessDeniedException("Not Authorized");
        }

        return ResponseEntity.ok(
                menuItemService.updateProduct(restaurantId, id, request));
    }

    @PatchMapping("/{id}/availability")
    public ResponseEntity<String> updateAvailability(
            @PathVariable @NotNull UUID id,
            @RequestParam Boolean available) {

        menuItemService.updateAvailability(id, available);
        return ResponseEntity.ok("Availability updated successfully");
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteProduct(
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role,
            @PathVariable @NotNull UUID id) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            throw new AccessDeniedException("Not Authorized");
        }

        menuItemService.deleteProduct(restaurantId, id);
        return ResponseEntity.ok("Deleted Successfully");
    }

    @PostMapping("/price")
    public Double calculateTotal(
            @RequestBody @NotEmpty List<@Valid OrderItemDto> items) {

        return menuItemService.calculateTotal(items);
    }

    @GetMapping("/{id}/price")
    public ResponseEntity<Double> getItemPrice(
            @PathVariable @NotNull UUID id) {

        return ResponseEntity.ok(menuItemService.getItemPrice(id));
    }

    @GetMapping("/reindex")
    public String reindexMenu() {
        searchSyncService.reindexMenuItems();
        return "Menu items successfully reindexed";
    }
}