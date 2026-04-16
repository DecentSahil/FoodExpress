package com.auth.backend.auth_app.services;

import com.auth.backend.auth_app.dtos.UserDto;

public interface AuthService {
    UserDto register(UserDto userDto);
}
