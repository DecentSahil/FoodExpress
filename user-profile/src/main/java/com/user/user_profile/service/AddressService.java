package com.user.user_profile.service;

import com.user.user_profile.dto.AddressUpdationRequest;
import com.user.user_profile.entities.Address;

import java.util.List;
import java.util.UUID;

public interface AddressService {

    List<Address> getUserAdddresses(String email);

    List<Address> getAllAdddresses(String email);

    void updateUserAddress(String email, AddressUpdationRequest addressUpdationRequest);

    Address addNewAddress(String email, com.user.user_profile.dto.AddressCreateRequest addressCreateRequest);

    void deleteUserAddress(String email, UUID addressId);
    
    void setDefaultAddress(String email, UUID addressId);

}
