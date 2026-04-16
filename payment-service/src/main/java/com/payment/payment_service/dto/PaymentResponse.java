package com.payment.payment_service.dto;


import lombok.AllArgsConstructor;

import lombok.Data;

@Data
public class PaymentResponse {

    private String paymentId;
    private String clientSecret;
    private Long amount;
    private String currency;

}