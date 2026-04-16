package com.auth.backend.auth_app.services;

import com.auth.backend.auth_app.dtos.UserDto;


public interface UserService {

    UserDto createUser(UserDto userDto);
    UserDto GetUserByEmail(String email);
    UserDto updateUser(UserDto userDto,String userId);
    void deleteUser(String userId);
    UserDto getUserById(String userId);
    public Iterable<UserDto> getAllUsers();
}

