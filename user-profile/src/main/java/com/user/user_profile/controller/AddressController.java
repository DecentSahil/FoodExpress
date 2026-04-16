package com.user.user_profile.controller;

import com.user.user_profile.dto.AddressUpdationRequest;
import com.user.user_profile.entities.Address;
import com.user.user_profile.service.AddressService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Validated
@RestController
@RequestMapping("user/address")
public class AddressController {

    private final AddressService addressService;

    AddressController(AddressService addressService){
        this.addressService = addressService;
    }

    @GetMapping("/all")
    public ResponseEntity<List<Address>> getAllAddresses(
            @RequestHeader("X-User-Email") @NotBlank @Email String email){
        return ResponseEntity.ok(addressService.getAllAdddresses(email));
    }

    @GetMapping
    public ResponseEntity<List<Address>> getUserAddress(
            @RequestHeader("X-User-Email") @NotBlank @Email String email){
        return ResponseEntity.ok(addressService.getUserAdddresses(email));
    }

    @PostMapping
    public ResponseEntity<AddressUpdationRequest> addNewAddress(
            @RequestHeader("X-User-Email") @NotBlank @Email String email,
            @RequestBody @Valid AddressUpdationRequest addressUpdationRequest){
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(addressService.addNewAddress(email,addressUpdationRequest));
    }

    @PutMapping
    public ResponseEntity<?> updateAddress(
            @RequestHeader("X-User-Email") @NotBlank @Email String email,
            @RequestBody @Valid AddressUpdationRequest addressUpdationRequest){
        addressService.updateUserAddress(email,addressUpdationRequest);
        return ResponseEntity.ok("updated successfully");
    }

    @DeleteMapping("/{addressId}")
    public ResponseEntity<String> deleteAddress(
            @RequestHeader("X-User-Email") @NotBlank @Email String email,
            @PathVariable @NotNull UUID addressId) {
        addressService.deleteUserAddress(email, addressId);
        return ResponseEntity.ok("Address deleted successfully");
    }

    @PutMapping("/{addressId}/default")
    public ResponseEntity<String> setDefaultAddress(
            @RequestHeader("X-User-Email") @NotBlank @Email String email,
            @PathVariable @NotNull UUID addressId) {
        addressService.setDefaultAddress(email, addressId);
        return ResponseEntity.ok("Default address updated successfully");
    }
}