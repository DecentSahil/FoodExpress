package com.user.user_profile.service.impl;

import com.user.user_profile.dto.RegisterRequest;
import com.user.user_profile.dto.UserDto;
import com.user.user_profile.dto.UserProfile;
import com.user.user_profile.entities.User;
import com.user.user_profile.exception.UserNotFoundException;
import com.user.user_profile.repository.AddressRepository;
import com.user.user_profile.repository.UserRepository;
import com.user.user_profile.service.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;


@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final AddressRepository addressRepository;
    private final String uploadDir = "/app/uploads/userphoto";

    public UserServiceImpl(UserRepository userRepository,ModelMapper modelMapper,AddressRepository addressRepository){
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.addressRepository = addressRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfile getUserProfile(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UserNotFoundException("Invalid email"));
        System.out.println("user number number: "+user.getnumber());
        return new UserProfile(user.getName(),user.getEmail(),user.getProfilePic(),user.getnumber(),user.getAddress());
    }


    @Override
    public void updateUserProfile(String email, UserDto userDto){
        User user = userRepository.findByEmail(email).orElseThrow(() ->new UserNotFoundException("Invalid users"));
        user.setnumber(userDto.number());
        System.out.println(userDto.number());
        user.setName(userDto.name());
        userRepository.save(user);

    }

    private String saveImage(MultipartFile file) {

        try {
            File directory = new File(uploadDir);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir, fileName);
            Files.copy(file.getInputStream(), filePath);

            return fileName;

        } catch (IOException e) {
            throw new RuntimeException("Image upload failed");
        }
    }

    @Override
    public void updateProfilePic(String email, MultipartFile image){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("invalid user"));
        String fileName = saveImage(image);
        user.setProfilePic(fileName);
        userRepository.save(user);
    }


    @Override
    public void deleteUser(String email){

        User user = userRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("No such user exist"));
        userRepository.delete(user);
    }


    public void deactivateUser(String email){
        User user = userRepository.findByEmail(email).orElseThrow(()-> new UserNotFoundException("Invalid user"));
        user.setActive(false);
        userRepository.save(user);
    }

    @Override
    public void createUser(RegisterRequest registerRequest) {
        System.out.println("inside user details"+registerRequest.email()+" "+registerRequest.name());
        User user = new User();
        user.setEmail(registerRequest.email());
        user.setName(registerRequest.name());

        userRepository.save(user);
    }




}
