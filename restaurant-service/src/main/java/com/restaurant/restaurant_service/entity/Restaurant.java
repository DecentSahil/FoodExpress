package com.restaurant.restaurant_service.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "restaurants")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class Restaurant {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;
    @Column(nullable = false,unique = true)
    private String email;

    private String imageName;
    private String description;
    private String address;
    private String cuisineType;
    private Double rating;
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Status status;
    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
    @Column(nullable = false)
    private boolean isActive = false;



}
