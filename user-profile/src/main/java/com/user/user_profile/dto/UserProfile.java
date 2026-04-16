package com.user.user_profile.dto;

import com.user.user_profile.entities.Address;

import java.util.List;

public record UserProfile(
        String name,
        String email,
        String profilePic,
        String number,
        List<Address> addressList
) {
}
