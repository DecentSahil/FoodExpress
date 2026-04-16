package com.auth.auth_service.service.impl;

import com.auth.auth_service.dto.*;
import com.auth.auth_service.entity.AuthUser;
import com.auth.auth_service.entity.Otp;
import com.auth.auth_service.enums.Status;
import com.auth.auth_service.exception.InvalidCredentialsException;
import com.auth.auth_service.exception.InvalidOtpException;
import com.auth.auth_service.feign.NotificationClient;
import com.auth.auth_service.feign.RestaurantClient;
import com.auth.auth_service.feign.UserClient;
import com.auth.auth_service.repository.AuthUserRepository;
import com.auth.auth_service.repository.OtpRepository;
import com.auth.auth_service.security.JwtUtil;
import com.auth.auth_service.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Random;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final RestaurantClient restaurantClient;
    private final NotificationClient notificationClient;
    private final UserClient userClient;
    private final OtpRepository otpRepository;

    public String generateOtp() {
        return String.valueOf(new Random().nextInt(900000) + 100000);
    }

    @Transactional
    @Override
    public String sendOtp(RegisterRequest request) {

        authUserRepository.findByEmail(request.getEmail())
                .ifPresent(user -> {
                    throw new InvalidCredentialsException("User already registered");
                });

        Otp otpEntity = otpRepository.findByEmail(request.getEmail())
                .orElse(new Otp());

        // Rate limiting
        if (otpEntity.getExpiryTime() != null &&
                otpEntity.getExpiryTime().isAfter(LocalDateTime.now())) {
            throw new RuntimeException("OTP already sent. Please wait");
        }

        String otp = generateOtp();

        otpEntity.setEmail(request.getEmail());
        otpEntity.setOtp(otp);

        if (otpEntity.getId() == null) {
            otpEntity.setAttempts(0);
        }

        otpEntity.setExpiryTime(LocalDateTime.now().plusMinutes(5));

        otpRepository.save(otpEntity);

        String message = """
        <b>Thank you for signing up with FoodExpress</b><br>
        Please enter the OTP below:<br><br>
        <b>%s</b>
        """.formatted(otp);


        notificationClient.sendEmail(
                new EmailRequest(request.getEmail(), "FoodExpress", message)
        );

        return "OTP sent successfully";
    }


    @Transactional(noRollbackFor = InvalidOtpException.class)
    @Override
    public RegisterResponse verifyOtpAndRegister(RegisterRequest request, String otp) {

        Otp savedOtp = otpRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("OTP not found,Request a new otp"));


        if(savedOtp.getExpiryTime().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }

        if(!savedOtp.getOtp().equals(otp)) {

            int newAttemptCount = savedOtp.getAttempts() + 1;
            savedOtp.setAttempts(newAttemptCount);

            otpRepository.saveAndFlush(savedOtp);

            if(newAttemptCount >= 3) {
                otpRepository.delete(savedOtp);
                throw new InvalidOtpException("Too many failed attempts. Please request a new OTP.");
            }

            System.out.println(request.getName()+" "+request.getEmail());

            throw new InvalidOtpException("Invalid OTP. Attempt: " + newAttemptCount);
        }
        userClient.registrationDetails(new UserDetails(request.getName(), request.getEmail()));


        AuthUser user = new AuthUser();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_USER");
        user.setEnabled(true);

        AuthUser savedUser = authUserRepository.save(user);

        otpRepository.delete(savedOtp);

        RegisterRequest userdetails = new RegisterRequest();
//        userdetails.setId(savedUser.getId());
        userdetails.setName(request.getName());
        userdetails.setEmail(request.getEmail());

//        userClient.registrationDetails(userdetails);

        RegisterResponse response = new RegisterResponse();
        response.setUserId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setMessage("User registered successfully");

        return response;
    }

    public LoginResponse login(LoginRequest request) {

        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("Invalid email or password");
        }

        if (!user.isEnabled()) {
            throw new RuntimeException("Account is disabled");
        }

        String role = user.getRole();
        UUID restaurantId = null;

        if ("ROLE_RESTAURANT".equals(role)) {

            RestaurantValidationResponse response =
                    restaurantClient.validateRestaurant(user.getEmail());

            if (!response.isActive() || response.status() != Status.APPROVED) {
                throw new RuntimeException("Restaurant not approved");
            }

            restaurantId = response.id();
        }

        String accessToken = JwtUtil.generateToken(
                user.getId().toString(),
                user.getEmail(),
                role,
                restaurantId
        );

        UserDto userDto = new UserDto(
                user.getId(),
                user.getEmail(),
                role.substring(5)
        );
        return new LoginResponse(
                accessToken,
                null,
                900L,
                userDto
        );

    }


    @Override
    public void setRestaurantPassword(SetPasswordRequest request) {

        if (authUserRepository.existsByEmail(request.email())) {
            throw new RuntimeException("Password already set for this restaurant");
        }

        RestaurantValidationResponse validation =
                restaurantClient.validateRestaurant(request.email());

        if (validation.status() != Status.APPROVED || !validation.isActive()) {
            throw new RuntimeException("Restaurant is not approved yet");
        }

        AuthUser user = new AuthUser();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole("ROLE_RESTAURANT");
        user.setEnabled(true);


        authUserRepository.save(user);
    }




    @Override
    public ResponseEntity<RegisterResponse> registerAdmin(RegisterRequest request) {

        AuthUser user = new AuthUser();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole("ROLE_ADMIN");
        user.setEnabled(true);

        AuthUser savedUser = authUserRepository.save(user);

        RegisterResponse response = new RegisterResponse();
        response.setUserId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setMessage("Admin registered successfully");



        return ResponseEntity.ok(response);
    }

    @Override
    public void forgotPassword(String email) {

        AuthUser user = authUserRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String token = UUID.randomUUID().toString();

        user.setResetToken(token);
        user.setResetTokenExpiry(LocalDateTime.now().plusMinutes(15));

        authUserRepository.save(user);

        String frontendUrl = System.getenv("FRONTEND_URL") != null ? System.getenv("FRONTEND_URL") : "http://localhost:5173";
        String link = frontendUrl + "/reset-password?token=" + token;

        String message = """
        <h3>Reset Your Password</h3>
        Click below link to reset password:<br>
        <a href="%s">Reset Password</a>
        """.formatted(link);

        notificationClient.sendEmail(
                new EmailRequest(user.getEmail(), "Reset Password", message)
        );
    }

    @Override
    public void resetPassword(String token, String newPassword) {

        AuthUser user = authUserRepository.findByResetToken(token)
                .orElseThrow(() -> new RuntimeException("Invalid token"));

        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Token expired");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);

        authUserRepository.save(user);
    }


}
