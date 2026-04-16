package com.auth.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequest {

    @NotBlank(message = "email cannot be empty")
    @Email(message = "please enter valid email")
    private String email;
    @NotBlank(message = "password cannot be empty")
    private String password;

}
