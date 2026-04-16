package com.auth.auth_service.dto;

import java.util.UUID;

public record UserDetails(
        String name,
        String email
) {
}
