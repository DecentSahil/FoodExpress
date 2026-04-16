package com.auth.auth_service.service;

import com.auth.auth_service.dto.*;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;

public interface AuthService {
//    RegisterResponse register(RegisterRequest request);

    String sendOtp(RegisterRequest request);

    @Transactional
    RegisterResponse verifyOtpAndRegister(RegisterRequest request, String otp);

    LoginResponse login(LoginRequest request);

    void setRestaurantPassword(SetPasswordRequest request);

    ResponseEntity<RegisterResponse> registerUser(RegisterRequest request);

    void forgotPassword(String email);

    void resetPassword(String token, String newPassword);
}
