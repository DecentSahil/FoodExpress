package com.auth.auth_service.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
@Entity
@Getter
@Setter
@Table(name = "otp", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class Otp {

    @Id
    @GeneratedValue
    private Long id;

    private String email;

    private String otp;

    private LocalDateTime expiryTime;

    private int attempts;

}