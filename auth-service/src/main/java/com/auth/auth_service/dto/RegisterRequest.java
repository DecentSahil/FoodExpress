package com.auth.auth_service.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message ="email cannot be blank")
    @Email(message = "please enter valid email")
    @Size(max = 40, message = "email too long")
    private String email;

    @NotBlank(message = "name cannot be blank")
    @Size(max = 40 ,message = "name too long")
    private String name;

    @NotBlank(message = "password cannot be empty")
    @Size(min = 8, max = 20, message = "password size should be between 8 and 20")
    @Pattern(
            regexp = "^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=])(?=\\S+$).{8,}$",
            message = "Password must contain one capital, one small, one number and one special character"
    )
    private String password;
}