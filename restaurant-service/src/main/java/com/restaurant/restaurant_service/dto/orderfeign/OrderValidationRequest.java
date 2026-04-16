package com.restaurant.restaurant_service.dto.orderfeign;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderValidationRequest {

    @NotNull(message = "RestaurantId cannot be null")
    private UUID restaurantId;

    @NotEmpty(message = "Items cannot be empty")
    private List<@Valid OrderItemRequest> items;
}