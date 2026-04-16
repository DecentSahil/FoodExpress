package com.auth.auth_service.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.auth.auth_service.entity.Otp;

import java.util.Optional;
import java.util.UUID;

public interface OtpRepository extends JpaRepository<Otp, UUID> {
    Optional<Otp> findByEmail(String email);
    Optional<Otp> findByEmailAndOtp(String email,String otp);

    int deleteByEmail(String email);
}
