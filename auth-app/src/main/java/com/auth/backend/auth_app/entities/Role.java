package com.auth.backend.auth_app.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

import java.util.UUID;


@Getter
@Setter
@NoArgsConstructor
@Builder
@AllArgsConstructor
@Entity(name = "roles")
public class Role {
    @Id
    @Column(name = "role_id")
    private UUID id=UUID.randomUUID();
    @Column(unique = true,nullable = false)
    private String name;
}
