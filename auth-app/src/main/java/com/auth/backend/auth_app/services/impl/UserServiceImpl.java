package com.auth.backend.auth_app.services.impl;


import com.auth.backend.auth_app.dtos.UserDto;
import com.auth.backend.auth_app.entities.Provider;
import com.auth.backend.auth_app.entities.User;
import com.auth.backend.auth_app.exceptions.ResourceNotFoundExceptions;
import com.auth.backend.auth_app.helpers.UserHelper;
import com.auth.backend.auth_app.repositories.UserRepository;
import com.auth.backend.auth_app.services.UserService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    @Override
    @Transactional
    public UserDto createUser(UserDto userDto) {
        if(userDto.getEmail()==null ||userDto.getEmail().isBlank()){
            throw new IllegalArgumentException("Email is Required");
        }

        if(userRepository.existsByEmail(userDto.getEmail())){
            throw  new IllegalArgumentException("Email already Registered");
        }

        User user = modelMapper.map(userDto,User.class);
        user.setProvider(userDto.getProvider()!=null?userDto.getProvider(): Provider.LOCAL);

        User saveUser = userRepository.save(user);

        return  modelMapper.map(saveUser,UserDto.class);
    }

    @Override
    public UserDto GetUserByEmail(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(()->new ResourceNotFoundExceptions("User not found with given id"));

        return modelMapper.map(user,UserDto.class);
    }

    @Override
    public UserDto updateUser(UserDto userDto, String userId) {
        UUID uId = UserHelper.parseUUID(userId);
        User existingUser = userRepository.findById(uId).orElseThrow(()->new ResourceNotFoundExceptions("User not found with given Id"));
        if(userDto.getName()!=null)existingUser.setName(userDto.getName());
        if(userDto.getImage()!=null)existingUser.setImage(userDto.getImage());
        if(userDto.getProvider()!=null)existingUser.setProvider(userDto.getProvider());
        if(userDto.getPassword()!=null)existingUser.setPassword(userDto.getPassword());
        existingUser.setEnable(userDto.isEnable());
        existingUser.setUpdatedAt(Instant.now());
        User user = userRepository.save(existingUser);
        return modelMapper.map(user,UserDto.class);
    }

    @Override
    public void deleteUser(String userId) {
        UUID uId= UserHelper.parseUUID(userId);
        User user = userRepository.findById(uId).orElseThrow(()->new ResourceNotFoundExceptions("User not found with given id"));
        userRepository.delete(user);

    }

    @Override
    public UserDto getUserById(String userId) {

        User user = userRepository.findById(UserHelper.parseUUID(userId)).orElseThrow(()->new ResourceNotFoundExceptions("User not found with given id"));
        return modelMapper.map(user,UserDto.class);
    }

    @Override
    @Transactional
    public Iterable<UserDto> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(user ->modelMapper.map(user,UserDto.class))
                .toList();
    }
}
