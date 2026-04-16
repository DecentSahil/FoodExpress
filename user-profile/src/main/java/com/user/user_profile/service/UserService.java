package com.user.user_profile.service;

import com.user.user_profile.dto.AddressUpdationRequest;
import com.user.user_profile.dto.RegisterRequest;
import com.user.user_profile.dto.UserDto;
import com.user.user_profile.dto.UserProfile;
import com.user.user_profile.entities.Address;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

public interface UserService {
    UserProfile getUserProfile(String email);
    void updateUserProfile(String email,UserDto userDto);



    void updateProfilePic(String email, MultipartFile image);

    void deleteUser(String email);

    void createUser(RegisterRequest registerRequest);

}
