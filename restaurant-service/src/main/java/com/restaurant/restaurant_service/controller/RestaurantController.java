package com.restaurant.restaurant_service.controller;

import com.restaurant.restaurant_service.dto.RestaurantRequest;
import com.restaurant.restaurant_service.dto.RestaurantResponse;
import com.restaurant.restaurant_service.dto.RestaurantValidationResponse;
import com.restaurant.restaurant_service.dto.orderfeign.OrderValidationRequest;
import com.restaurant.restaurant_service.dto.orderfeign.OrderValidationResponse;
import com.restaurant.restaurant_service.service.RestaurantService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequiredArgsConstructor
@RequestMapping("/restaurant")
public class RestaurantController {

    private final RestaurantService restaurantService;

    @PostMapping(value = "/register", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<RestaurantResponse> register(
            @ModelAttribute @Valid RestaurantRequest request) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(restaurantService.createRestaurant(request));
    }

    @PatchMapping("/admin/{id}/approve")
    public ResponseEntity<RestaurantResponse> approve(
            @PathVariable @NotNull(message = "Id cannot be null") UUID id) {

        return ResponseEntity.ok(restaurantService.approveRestaurant(id));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<RestaurantResponse>> getAll() {
        return ResponseEntity.ok(restaurantService.getAllRestaurants());
    }

    @PostMapping("/order-details")
    public OrderValidationResponse validateOrder(
            @RequestBody @Valid OrderValidationRequest request) {

        return restaurantService.validateOrder(request);
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable @NotNull(message = "Id cannot be null") UUID id) {

        restaurantService.deleteRestaurant(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/internal/validate")
    public ResponseEntity<RestaurantValidationResponse> validate(
            @RequestParam
            @NotBlank(message = "Email cannot be blank")
            @Email(message = "Enter valid email")
            String email) {

        return ResponseEntity.ok(restaurantService.validateRestaurant(email));
    }

    @GetMapping("/{id}/exists")
    public boolean validate(
            @PathVariable @NotNull(message = "Id cannot be null") UUID id) {

        return restaurantService.checkExists(id);
    }

    @PutMapping(value = "photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public void update(
            @RequestHeader("X-Restaurant-Id")
            @NotBlank(message = "Restaurant Id header is required")
            String restaurantId,

            @ModelAttribute MultipartFile image) {

        restaurantService.updatePhoto(restaurantId, image);
    }
}