package com.auth.auth_service.dto;

import com.auth.auth_service.enums.Status;

import java.util.UUID;

public record RestaurantValidationResponse(
        UUID id,
        String email,
        boolean isActive,
        Status status
) {}
