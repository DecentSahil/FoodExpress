package com.notification.notification_service.service;

//import com.notification.notification_service.dto.EmailRequest;
import com.notification.notification_service.dto.EmailRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class NotificationConsumer {

    private final EmailService emailService;
    @KafkaListener(topics = "notification-topic", groupId = "notification-group")
    public void consume(EmailRequest emailRequest) {
        System.out.println("Sending email to: " + emailRequest.getTo());
        emailService.sendEmail(emailRequest);
    }
}