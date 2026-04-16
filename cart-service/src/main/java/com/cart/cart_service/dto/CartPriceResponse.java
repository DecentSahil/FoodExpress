package com.cart.cart_service.dto;

public record CartPriceResponse(
        double itemTotal,
        int deliveryCharge,
        float tax,
        Double grandTotal
) {
}
