package com.restaurant.restaurant_service.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class EmailRequest {

    @NotBlank(message = "Recipient email cannot be blank")
    @Email(message = "Invalid email format")
    private String to;

    @NotBlank(message = "Subject cannot be blank")
    @Size(max = 100, message = "Subject must not exceed 100 characters")
    private String subject;

    @NotBlank(message = "Message cannot be blank")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

}