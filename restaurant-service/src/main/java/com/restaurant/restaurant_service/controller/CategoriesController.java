package com.restaurant.restaurant_service.controller;

import com.restaurant.restaurant_service.dto.CategoryRequest;
import com.restaurant.restaurant_service.dto.CategoryResponse;
import com.restaurant.restaurant_service.service.CategoryService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping("/restaurant/category")
public class CategoriesController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role,
            @RequestBody @Valid CategoryRequest request) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(categoryService.createCategory(restaurantId, request.categoryName()));
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getMyCategories(
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(categoryService.getMyCategories(restaurantId));
    }

    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable @NotNull UUID categoryId,
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        categoryService.deleteCategory(categoryId, restaurantId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable @NotNull UUID categoryId,
            @RequestHeader("X-Restaurant-Id") @NotNull UUID restaurantId,
            @RequestHeader("X-User-Role") @NotBlank String role,
            @RequestBody @Valid CategoryRequest request) {

        if (!"ROLE_RESTAURANT".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        return ResponseEntity.ok(
                categoryService.updateCategory(categoryId, restaurantId, request.categoryName())
        );
    }

    @GetMapping("/all")
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {
        return ResponseEntity.ok(categoryService.getAllCategories());
    }
}