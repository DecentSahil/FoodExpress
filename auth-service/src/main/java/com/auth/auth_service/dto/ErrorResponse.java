package com.auth.auth_service.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.Map;

@Getter
@Setter
public class ErrorResponse {

    private String error;
    private int status;
    private String path;
    private LocalDateTime timestamp;
    private Map<String, String> errors;

    public ErrorResponse(String error, int status, String path, LocalDateTime timestamp) {
        this.error = error;
        this.status = status;
        this.path = path;
        this.timestamp = timestamp;
    }

    // Constructor with field errors
    public ErrorResponse(String error, int status, String path,
                         LocalDateTime timestamp, Map<String, String> errors) {
        this.error = error;
        this.status = status;
        this.path = path;
        this.timestamp = timestamp;
        this.errors = errors;
    }
}
