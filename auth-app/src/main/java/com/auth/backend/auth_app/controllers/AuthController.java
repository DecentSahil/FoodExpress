package com.auth.backend.auth_app.controllers;


import com.auth.backend.auth_app.config.JwtProperties;
import com.auth.backend.auth_app.dtos.ErrorResponse;
import com.auth.backend.auth_app.dtos.LoginRequest;
import com.auth.backend.auth_app.dtos.TokenResponse;
import com.auth.backend.auth_app.dtos.UserDto;
import com.auth.backend.auth_app.entities.RefreshToken;
import com.auth.backend.auth_app.entities.User;
import com.auth.backend.auth_app.repositories.RefreshTokenRepository;
import com.auth.backend.auth_app.repositories.UserRepository;
import com.auth.backend.auth_app.security.CookieService;
import com.auth.backend.auth_app.security.JwtService;
import com.auth.backend.auth_app.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.UUID;

@RestController
@RequestMapping("api/v1/auth")
@AllArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final AuthenticationManager authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;
    private final CookieService cookieService;
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final ModelMapper modelMapper;

    @PostMapping("/login")
    private ResponseEntity<TokenResponse> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response){
        Authentication authenticate = authenticate(loginRequest);
        User user = userRepository.findByEmail(loginRequest.email()).orElseThrow(()->new BadCredentialsException("Invalid username or passsword"));
        if(!user.isEnable()){
            throw new DisabledException("User is disable");
        }

        String jti = UUID.randomUUID().toString();
        Instant now = Instant.now();
        var refreshTokenOb = RefreshToken.builder()
                .jti(jti)
                .user(user)
                .createdAt(now)
                .expiresAt(now.plusSeconds(jwtService.getRefreshTtlSeconds()))
                .revoked(false)
                .build();

        refreshTokenRepository.save(refreshTokenOb);
        String accessToken = jwtService.generateAccessToken(user);
        String refreshToken = jwtService.generateRefreshToken(user,refreshTokenOb.getJti());

        cookieService.attachRefreshCookie(response,refreshToken,(int)jwtService.getRefreshTtlSeconds());
        cookieService.addNoStoreHeaders(response);
        TokenResponse tokenResponse = TokenResponse.of(accessToken,refreshToken,jwtProperties.getAccessTtlSeconds(),modelMapper.map(user,UserDto.class));

        return ResponseEntity.ok(tokenResponse);
    }
    private Authentication authenticate(LoginRequest loginRequest) {
        try {
            return authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.email(),
                            loginRequest.password()
                    )
            );
        } catch (Exception e) {
            throw new BadCredentialsException("Invalid Username or Password");
        }
    }


    @PostMapping("/register")
    private ResponseEntity<UserDto> register(@RequestBody UserDto userDto){
        UserDto userDto1 = authService.register(userDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(userDto1);
    }
}
