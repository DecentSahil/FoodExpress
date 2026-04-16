//package com.payment.payment_service.service.impl;
//
//
//import com.payment.payment_service.dto.CreateOrderRequest;
//import com.payment.payment_service.dto.PaymentResponse;
//import com.payment.payment_service.entity.Payment;
//import com.payment.payment_service.repository.PaymentRepository;
//import com.payment.payment_service.service.PaymentService;
//import com.razorpay.Order;
//import com.razorpay.RazorpayClient;
//import org.json.JSONObject;
//import org.springframework.stereotype.Service;
//
//@Service
//public class PaymentServiceImpl implements PaymentService {
//
//    private final RazorpayClient razorpayClient;
//    private final PaymentRepository paymentRepository;
//
//    public PaymentServiceImpl(RazorpayClient razorpayClient,
//                              PaymentRepository paymentRepository) {
//        this.razorpayClient = razorpayClient;
//        this.paymentRepository = paymentRepository;
//    }
//
//    /*
//    @Override
//    public PaymentResponse createOrder(CreateOrderRequest request) throws Exception {
//
//        JSONObject orderRequest = new JSONObject();
//        orderRequest.put("amount", request.getAmount() * 100);
//        orderRequest.put("currency", "INR");
//        orderRequest.put("receipt", "txn_123456");
//
//        Order order = razorpayClient.orders.create(orderRequest);
//
//        Payment payment = new Payment(
//                order.get("id"),
//                request.getAmount(),
//                "CREATED"
//        );
//
//        paymentRepository.save(payment);
//
//        return new PaymentResponse(
//                order.get("id"),
//                request.getAmount(),
//                "INR"
//        );
//    }*/
//}