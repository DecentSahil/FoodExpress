package com.payment.payment_service.controller;

import com.payment.payment_service.dto.CreateOrderRequest;
import com.payment.payment_service.dto.PaymentResponse;
import com.payment.payment_service.service.StripeService;
import com.stripe.model.PaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
public class PaymentController {

//    private final PaymentService paymentService;
    private final StripeService stripeService;



    @PostMapping("/create")
    public PaymentResponse createPayment(@RequestBody CreateOrderRequest createOrderRequest) throws Exception {
        return stripeService.createPayment(createOrderRequest.getAmount());
    }

//    @PostMapping("/create-order")
//    public PaymentResponse createOrder(@RequestBody CreateOrderRequest request) throws Exception {
//
//        return paymentService.createOrder(request);
//    }
}