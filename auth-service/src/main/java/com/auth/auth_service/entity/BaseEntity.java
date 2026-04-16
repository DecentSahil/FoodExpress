package com.auth.auth_service.entity;


import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@RequiredArgsConstructor
@ToString
public class BaseEntity {

    private LocalDateTime createdAt;

    private String createdBy;

}
