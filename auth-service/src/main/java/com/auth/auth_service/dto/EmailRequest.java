package com.auth.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record EmailRequest(

        @NotBlank(message = "Sender email cannot be blank")
        @Email(message = "Please enter valid email")
        String to,

        @NotBlank(message = "Subject cannot be empty")
        String subject,

        @NotBlank(message = "Message body cannot be empty")
        String message
) {}