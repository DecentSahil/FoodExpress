package com.auth.backend.auth_app.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import com.auth.backend.auth_app.entities.User;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
}
