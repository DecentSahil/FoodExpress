package com.order.order_service.dto;

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