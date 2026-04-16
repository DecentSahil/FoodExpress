package com.payment.payment_service.service;
import com.payment.payment_service.dto.PaymentResponse;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.stereotype.Service;

@Service
public class StripeService {

    public PaymentResponse createPayment(Long amount) throws Exception {

        PaymentIntentCreateParams params =
                PaymentIntentCreateParams.builder()
                        .setAmount(amount)
                        .setCurrency("inr")
                        .build();

        PaymentIntent intent = PaymentIntent.create(params);

        PaymentResponse response = new PaymentResponse();
        response.setPaymentId(intent.getId());
        response.setClientSecret(intent.getClientSecret());
        response.setAmount(intent.getAmount());
        response.setCurrency(intent.getCurrency());

        return response;
    }
}