package com.user.user_profile.controller;

import com.user.user_profile.dto.UserDto;
import com.user.user_profile.dto.UserProfile;
import com.user.user_profile.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@Validated
@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/profile")
    public ResponseEntity<UserProfile> getUserProfile(
            @RequestHeader("X-User-Email") @NotBlank @Email String email) {

        return ResponseEntity.ok(userService.getUserProfile(email));
    }

    @PostMapping(value = "/profile-pic", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> updateProfilePic(
            @RequestHeader("X-User-Email") @NotBlank @Email String email,
            @RequestParam("image") MultipartFile image) {

        userService.updateProfilePic(email, image);
        return ResponseEntity.ok("Updated Successfully");
    }

    @PutMapping("/profile")
    public ResponseEntity<String> updateUserProfile(
            @RequestHeader("X-User-Email") @NotBlank @Email String email,
            @RequestBody @Valid UserDto userDto) {

        userService.updateUserProfile(email, userDto);
        return ResponseEntity.ok("Updated successfully");
    }

    @DeleteMapping
    public ResponseEntity<String> deleteUser(
            @RequestHeader("X-User-Role") @NotBlank String role,
            @RequestHeader("X-User-Email") @NotBlank @Email String email) {

        if (!"ADMIN".equals(role)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to delete this user");
        }

        userService.deleteUser(email);
        return ResponseEntity.ok("Deleted Successfully");
    }
}