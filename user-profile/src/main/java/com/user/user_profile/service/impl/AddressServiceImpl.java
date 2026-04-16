package com.user.user_profile.service.impl;

import com.user.user_profile.dto.AddressUpdationRequest;
import com.user.user_profile.entities.Address;
import com.user.user_profile.entities.User;
import com.user.user_profile.exception.UserNotFoundException;
import com.user.user_profile.repository.AddressRepository;
import com.user.user_profile.repository.UserRepository;
import com.user.user_profile.service.AddressService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;


@Service
public class AddressServiceImpl implements AddressService {

    private final AddressRepository addressRepository;
    private final UserRepository userRepository;

    AddressServiceImpl(AddressRepository addressRepository,UserRepository userRepository){
        this.addressRepository =addressRepository;
        this.userRepository = userRepository;
    }


    @Override
    public List<Address> getUserAdddresses(String email){
        return addressRepository.findByEmail(email);
    }
    @Override
    public List<Address> getAllAdddresses(String email){
        return addressRepository.findAll();
    }

    @Override
    public void updateUserAddress(String email, AddressUpdationRequest addressUpdationRequest){
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("No such user exist"));
        Address address= addressRepository.findById(addressUpdationRequest.id()).orElseThrow(()->new UserNotFoundException("invalid addressId"));
        address.setName(addressUpdationRequest.name());
        address.setCity(addressUpdationRequest.city());
        address.setPincode(addressUpdationRequest.pincode());
        address.setState(addressUpdationRequest.state());
        address.setLine1(addressUpdationRequest.line1());
        address.setNumber(addressUpdationRequest.number());
        addressRepository.save(address);
    }

    @Override
    public AddressUpdationRequest addNewAddress(String email, AddressUpdationRequest addressUpdationRequest){
        User user = userRepository.findByEmail(email).orElseThrow(()->new UserNotFoundException("Invalid User"));
        Address address = new Address();
        address.setLine1(addressUpdationRequest.line1());
        address.setName(addressUpdationRequest.name());
        address.setCity(addressUpdationRequest.city());
        address.setState(addressUpdationRequest.state());
        address.setPincode(addressUpdationRequest.pincode());
        address.setEmail(email);
        address.setNumber(addressUpdationRequest.number());
        
        // If it's the user's first address, make it default automatically
        List<Address> existingAddresses = addressRepository.findByEmail(email);
        if (existingAddresses == null || existingAddresses.isEmpty()) {
            address.setIsDefault(true);
        }
        
        Address savedAddress = addressRepository.save(address);
        return new AddressUpdationRequest(savedAddress.getId(),savedAddress.getName(), savedAddress.getNumber(), savedAddress.getLine1(), savedAddress.getCity(), savedAddress.getState(), savedAddress.getPincode());
    }

    @Override
    public void deleteUserAddress(String email, UUID addressId) {
        Address address = addressRepository.findById(addressId)
                .orElseThrow(() -> new UserNotFoundException("Invalid addressId"));
        
        if (!address.getEmail().equals(email)) {
            throw new RuntimeException("Address does not belong to this user");
        }
        
        addressRepository.delete(address);
    }

    @Override
    public void setDefaultAddress(String email, UUID addressId) {
        // First verify the address exists and belongs to the user
        Address targetAddress = addressRepository.findById(addressId)
                .orElseThrow(() -> new UserNotFoundException("Invalid addressId"));
                
        if (!targetAddress.getEmail().equals(email)) {
            throw new RuntimeException("Address does not belong to this user");
        }

        List<Address> allAddresses = addressRepository.findByEmail(email);
        for (Address addr : allAddresses) {
            if (addr.getId().equals(addressId)) {
                addr.setIsDefault(true);
            } else {
                addr.setIsDefault(false);
            }
            addressRepository.save(addr);
        }
    }
}
