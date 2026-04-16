package com.restaurant.restaurant_service.service.impl;

import com.restaurant.restaurant_service.dto.*;
import com.restaurant.restaurant_service.dto.orderfeign.ItemPriceDto;
import com.restaurant.restaurant_service.dto.orderfeign.OrderItemRequest;
import com.restaurant.restaurant_service.dto.orderfeign.OrderValidationRequest;
import com.restaurant.restaurant_service.dto.orderfeign.OrderValidationResponse;
import com.restaurant.restaurant_service.entity.MenuItem;
import com.restaurant.restaurant_service.entity.Restaurant;
import com.restaurant.restaurant_service.entity.Status;
import com.restaurant.restaurant_service.feign.NotificationProducer;
import com.restaurant.restaurant_service.repository.MenuItemRepository;
import com.restaurant.restaurant_service.repository.RestaurantRepository;
import com.restaurant.restaurant_service.service.RestaurantService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final MenuItemRepository menuItemRepository;
    private final NotificationProducer notificationProducer;
    private final String uploadDir = "/app/uploads/restaurants";

    @Override
    @Transactional
    public RestaurantResponse createRestaurant(RestaurantRequest request) {

        if (restaurantRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Restaurant already exists with this email");
        }

        Restaurant restaurant = new Restaurant();
        restaurant.setName(request.name());
        restaurant.setEmail(request.email());
        restaurant.setAddress(request.address());
        restaurant.setCuisineType(request.cuisineType());
        restaurant.setStatus(Status.PENDING);
        restaurant.setActive(false);
        restaurant.setCreatedAt(LocalDateTime.now());
        if (request.image() != null && !request.image().isEmpty()) {
            String fileName = saveImage(request.image());
            restaurant.setImageName(fileName);
        }

        Restaurant saved = restaurantRepository.save(restaurant);

        return mapToResponse(saved);
    }

    @Override
    public RestaurantResponse approveRestaurant(UUID id) {
        // Save in its own transaction FIRST, then notify via Kafka
        Restaurant approved = approveAndSave(id);
        String frontendUrl = System.getenv("FRONTEND_URL") != null ? System.getenv("FRONTEND_URL") : "http://localhost:5173";
        String body = """
            <h1>Successfully Verified</h1>
            <h4>Set Password</h4>
            <p>Use the link below to set your password:</p>
            <a href="%s/set-password">Set Password</a>
        """.formatted(frontendUrl);

        try {
            notificationProducer.sendEmail(
                    new EmailRequest(approved.getEmail(),
                            "FoodExpress - Verification Successful",
                            body)
            );
        } catch (Exception e) {
            System.err.println("[WARN] Kafka notification failed for restaurant " + id + ": " + e.getMessage());
        }

        return mapToResponse(approved);
    }

    @Transactional
    protected Restaurant approveAndSave(UUID id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));
        restaurant.setStatus(Status.APPROVED);
        restaurant.setActive(true);
        return restaurantRepository.save(restaurant);
    }

    @Override
    public List<RestaurantResponse> getAllRestaurants() {
        return restaurantRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<PublicRestaurantResponse> getAllPublicRestaurants() {
        return restaurantRepository.findByIsActiveTrue()
                .stream()
                .map(r -> new PublicRestaurantResponse(r.getId(),r.getName(),r.getAddress(),r.getImageName()))
                .toList();
    }

    @Override
    @Transactional
    public void deleteRestaurant(UUID id) {
        if (!restaurantRepository.existsById(id)) {
            throw new RuntimeException("Restaurant not found");
        }
        restaurantRepository.deleteById(id);
    }

    @Override
    public RestaurantValidationResponse validateRestaurant(String email) {

        Restaurant restaurant = restaurantRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Restaurant not found"));

        return new RestaurantValidationResponse(restaurant.getId(),restaurant.getEmail(), restaurant.isActive(),restaurant.getStatus());
    }

    @Override
    public boolean checkExists(UUID restaurantId) {
        return restaurantRepository.existsById(restaurantId);
    }

    private RestaurantResponse mapToResponse(Restaurant r) {
        return new RestaurantResponse(
                r.getId(),
                r.getName(),
                r.getEmail(),
                r.getAddress(),
                r.getCuisineType(),
                r.isActive(),
                r.getStatus()
        );
    }

    @Override
    public String saveImage(MultipartFile file) {

        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            System.out.println("Saving file to: " + filePath.toAbsolutePath());
            Files.copy(file.getInputStream(), filePath);

            return fileName;

        } catch (IOException e) {
            throw new RuntimeException("Image upload failed");
        }
    }

     @Override
    public OrderValidationResponse validateOrder(OrderValidationRequest request) {

         Restaurant restaurant =
                 restaurantRepository.findById(request.getRestaurantId())
                         .orElse(null);

         if (restaurant == null) {
             return new OrderValidationResponse(false, null, 0.0, List.of());
         }

         double total = 0;
         List<ItemPriceDto> itemPrices = new ArrayList<>();

         for (OrderItemRequest item : request.getItems()) {

             MenuItem menuItem =
                     menuItemRepository.findById(item.getMenuItemId())
                             .orElseThrow(() -> new RuntimeException("Item not found"));

             double price = menuItem.getPrice();
             total += price * item.getQuantity();


             itemPrices.add(
                     new ItemPriceDto(menuItem.getId(),menuItem.getName(), price)
             );
         }

         return new OrderValidationResponse(
                 true,
                 restaurant.getName(),
                 total,
                 itemPrices
         );
     }

    @Override
    public void updatePhoto(String restaurantId,MultipartFile image) {
        Restaurant restaurant = restaurantRepository.findById(UUID.fromString(restaurantId)).orElseThrow(()-> new RuntimeException("No restaurant found"));
        String savedImage = saveImage(image);
        restaurant.setImageName(savedImage);
    }
}
