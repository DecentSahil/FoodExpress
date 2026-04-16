package com.order.order_service.feign;


import com.order.order_service.dto.EmailRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;


@Service
public class NotificationProducer {

    @Autowired
    private KafkaTemplate<String, EmailRequest> kafkaTemplate;

    public void sendEmail(EmailRequest emailRequest) {
        kafkaTemplate.send("notification-topic", emailRequest);
    }

}
