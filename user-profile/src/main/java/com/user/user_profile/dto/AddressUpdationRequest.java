package com.user.user_profile.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AddressUpdationRequest(

        // ID is now optional at the DTO level to prevent validation errors during creation
        UUID id,

        @NotBlank(message = "Name cannot be blank")
        @Size(min = 2, max = 50, message = "Name must be between 2 to 50 characters")
        String name,

        @NotBlank(message = "Phone number cannot be blank")
        @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
        String number,

        @NotBlank(message = "Address line1 cannot be blank")
        @Size(max = 100, message = "Address line1 must not exceed 100 characters")
        String line1,

        @NotBlank(message = "City cannot be blank")
        String city,

        @NotBlank(message = "State cannot be blank")
        String state,

        @NotBlank(message = "Pincode cannot be blank")
        @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must be 6 digits")
        String pincode

) {
}