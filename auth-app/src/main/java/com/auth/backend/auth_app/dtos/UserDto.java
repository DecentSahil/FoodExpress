package com.auth.backend.auth_app.dtos;

import com.auth.backend.auth_app.entities.Role;
import com.auth.backend.auth_app.entities.Provider;
import jakarta.persistence.Column;
import lombok.*;

import java.time.Instant;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserDto {

    private UUID id;
    private String email;
    private String name;
    private String password;
    private String image;
    private boolean enable = true;
    private Instant createdAt=Instant.now();
    private Instant updatedAt=Instant.now();
    private Provider provider=Provider.LOCAL;
    private Set<Role> roles = new HashSet<>();


}
