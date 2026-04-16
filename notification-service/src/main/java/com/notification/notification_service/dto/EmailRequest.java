package com.notification.notification_service.dto;


import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmailRequest {

    @Email(message = "Invalid email")
    @NotBlank(message = "Email cannot be empty")
    private String to;

    @NotBlank(message = "Subject cannot be empty")
    @Size(max = 255, message = "Subject too long")
    private String subject;

    @NotBlank(message = "Message body cannot be empty")
    @Size(max = 5000, message = "Message too long")
    private String message;
}