
package com.auth.auth_service.controller;

import com.auth.auth_service.dto.SetPasswordRequest;
import com.auth.auth_service.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth/restaurant")
public class RestaurantAuthController {

    private final AuthService authService;

    RestaurantAuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("/set-password")
    public ResponseEntity<String> setPassword(
            @RequestBody @Valid SetPasswordRequest request) {

        authService.setRestaurantPassword(request);
        return ResponseEntity.ok("Password set successfully. You can now login.");
    }

}
