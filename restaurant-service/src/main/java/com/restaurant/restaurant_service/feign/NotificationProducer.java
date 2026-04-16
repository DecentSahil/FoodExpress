package com.restaurant.restaurant_service.feign;


import com.restaurant.restaurant_service.dto.EmailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;


@Service
public class NotificationProducer {

    @Autowired
    private KafkaTemplate<String, EmailRequest> kafkaTemplate;

    public void sendEmail(EmailRequest emailRequest) {
        kafkaTemplate.send("notification-topic", emailRequest);
    }

}
