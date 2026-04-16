package com.auth.backend.auth_app.dtos;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class RoleDto {
    private UUID id=UUID.randomUUID();
    private String name;
}
