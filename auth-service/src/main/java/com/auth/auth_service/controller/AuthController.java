package com.auth.auth_service.controller;

import com.auth.auth_service.dto.*;
import com.auth.auth_service.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;


    @PostMapping("/send-otp")
    public ResponseEntity<String> sendOtp(
            @RequestBody @Valid RegisterRequest request) {

        String response = authService.sendOtp(request);
        return ResponseEntity.ok(response);
    }

    // Verify OTP and register user
    @PostMapping("/verify-otp")
    public ResponseEntity<RegisterResponse> verifyOtpAndRegister(
            @RequestBody @Valid RegisterRequest request,
            @RequestParam @NotBlank(message = "OTP cannot be empty") String otp) {

        RegisterResponse response =
                authService.verifyOtpAndRegister(request, otp);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/register/admin")
    public ResponseEntity<RegisterResponse> register1(
            @RequestBody @Valid RegisterRequest request) {
        return authService.registerUser(request);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody @Valid LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    public String me(
            @RequestHeader("X-User-Email") @NotBlank String email,
            @RequestHeader("X-User-Role") @NotBlank String role
    ) {

        return email + " | " + role;
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestBody @Valid ForgotPasswordRequest request) {
        authService.forgotPassword(request.getEmail());
        return ResponseEntity.ok("Reset link sent");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestBody @Valid ResetPasswordRequest request) {
        authService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Password updated");
    }

}

