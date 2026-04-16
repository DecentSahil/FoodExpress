package com.auth.backend.auth_app.services.impl;

import com.auth.backend.auth_app.dtos.UserDto;
import com.auth.backend.auth_app.services.AuthService;
import com.auth.backend.auth_app.services.UserService;
import lombok.AllArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Controller;


@Controller
@AllArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;

    private final PasswordEncoder passwordEncoder;
    @Override
    public UserDto register(UserDto userDto) {
        userDto.setPassword(passwordEncoder.encode(userDto.getPassword()));
        return  userService.createUser(userDto);


    }

}
