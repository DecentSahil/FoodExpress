package com.restaurant.restaurant_service.dto.orderfeign;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OrderValidationResponse {

    private boolean restaurantExists;
    private String restaurantName;
    private Double totalAmount;
    private List<ItemPriceDto> items;
}