package com.auth.backend.auth_app.dtos;

public record LoginRequest(
        String email,
        String password
) {

}
