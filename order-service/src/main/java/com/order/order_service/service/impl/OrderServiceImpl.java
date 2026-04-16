package com.order.order_service.service.impl;

import com.order.order_service.dto.*;
import com.order.order_service.entity.Order;
import com.order.order_service.entity.OrderItem;
import com.order.order_service.entity.OrderStatus;
import com.order.order_service.exception.ResourceNotFoundException;
import com.order.order_service.feign.NotificationClient;
import com.order.order_service.feign.NotificationProducer;
import com.order.order_service.feign.RestaurantClient;
import com.order.order_service.repository.OrderRepository;
import com.order.order_service.service.OrderService;
import jakarta.transaction.Transactional;
import java.lang.IllegalStateException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final RestaurantClient restaurantClient;
    private final NotificationClient notificationClient;
    private final NotificationProducer notificationProducer;


    @Override
    public OrderResponse createOrder(CreateOrderRequest request) {

        OrderValidationRequest validationRequest =
                new OrderValidationRequest(
                        request.restaurantId(),
                        request.items()
                );

        OrderValidationResponse validation =
                restaurantClient.validateOrder(validationRequest);

        if (!validation.isRestaurantExists()) {
            throw new ResourceNotFoundException("Restaurant not found");
        }

        Order order = new Order();
        order.setUserId(request.userId());
        order.setRestaurantId(request.restaurantId());
        order.setRestaurantName(validation.getRestaurantName());
        order.setStatus(OrderStatus.CREATED);
        order.setTotalAmount(validation.getTotalAmount());

        Map<UUID, ItemPriceDto> itemMap =
                validation.getItems()
                        .stream()
                        .collect(Collectors.toMap(
                                ItemPriceDto::getMenuItemId,
                                item -> item
                        ));

        List<OrderItem> orderItems = request.items()
                .stream()
                .map(i -> {

                    ItemPriceDto item = itemMap.get(i.getMenuItemId());

                    return new OrderItem(
                            null,
                            i.getMenuItemId(),
                            i.getQuantity(),
                            item.getPrice(),
                            item.getProductName(),
                            order
                    );

                })
                .toList();

        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        String itemsHtml = savedOrder.getItems()
                .stream()
                .map(i -> """
                <tr>
                    <td>%s</td>
                    <td>%s</td>
                    <td>₹%s</td>
                </tr>
                """.formatted(
                        i.getProductName(),
                        i.getQuantity(),
                        i.getPrice()
                ))
                .collect(Collectors.joining());
        String message = """
                <h2>Order Confirmation</h2>
        
                <p>Thank you for your order!</p>
        
                <p><b>Order ID:</b> %s</p>
                <p><b>Restaurant:</b> %s</p>
        
                <table border="1" cellpadding="5">
                    <tr>
                        <th>Item</th>
                        <th>Quantity</th>
                        <th>Price</th>
                    </tr>
                    %s
                </table>
        
                <br>
                <p><b>Total Amount:</b> ₹%s</p>
                <p><b>Status:</b> %s</p>
        
        """.formatted(
                        savedOrder.getId(),
                        savedOrder.getRestaurantName(),
                        itemsHtml,
                        savedOrder.getTotalAmount(),
                        savedOrder.getStatus()
        );

/*
        notificationClient.sendEmail(
                new EmailRequest(
                        request.userEmail(),
                        "FoodExpress - Order Confirmation",
                        message
                )
        );*/

        notificationProducer.sendEmail(
                new EmailRequest(
                        request.userEmail(),
                        "FoodExpress - Order Confirmation",
                        message
                )
        );

        return new OrderResponse(
                savedOrder.getId(),
                savedOrder.getRestaurantId(),
                savedOrder.getTotalAmount(),
                savedOrder.getStatus(),
                savedOrder.getCreatedAt()
        );
    }


    @Override
    public OrderDetailsResponse getOrderDetails(UUID orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        List<OrderItemResponse> items = order.getItems()
                .stream()
                .map(i -> new OrderItemResponse(
                        i.getMenuItemId(),
                        i.getProductName(),
                        i.getQuantity(),
                        i.getPrice()
                ))
                .toList();

        return new OrderDetailsResponse(
                order.getId(),
                order.getRestaurantName(),
                order.getRestaurantId(),
                items
        );
    }

    @Override
    public List<RestaurantOrderResponse> getOrdersByRestaurant(UUID restaurantId) {

        return orderRepository.findByRestaurantId(restaurantId)
                .stream()
                .map(this::mapToRestaurantOrderResponse)
                .toList();
    }

    @Transactional
    @Override
    public void updateStatus(UUID orderId, String status) {
        Order order = orderRepository.findById(orderId).orElseThrow(()-> new IllegalStateException("Invalid request No Such Order Id exists"));
        try {
            order.setStatus(OrderStatus.valueOf(status.toUpperCase()));
        } catch (IllegalArgumentException e) {
            throw new IllegalStateException("Invalid order status");
        }
    }


    public RestaurantOrderResponse mapToRestaurantOrderResponse(Order order){

        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getMenuItemId(),
                        i.getProductName(),
                        i.getQuantity(),
                        i.getPrice()
                ))
                .toList();

        return new RestaurantOrderResponse(
                order.getId(),
                order.getUserId(),
                items,
                order.getTotalAmount(),
                order.getStatus().name()
        );
    }

    @Override
    public List<UserOrderResponse> getOrdersByUser(UUID userId) {

        return orderRepository.findByUserId(userId)
                .stream()
                .map(this::mapToUserOrderResponse)
                .toList();
    }

    public UserOrderResponse mapToUserOrderResponse(Order order){

        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getMenuItemId(),
                        i.getProductName(),
                        i.getQuantity(),
                        i.getPrice()
                ))
                .toList();

        return new UserOrderResponse(
                order.getId(),
                order.getRestaurantName(),
                items,
                order.getTotalAmount(),
                order.getStatus().name(),
                order.getCreatedAt()
        );
    }


}
