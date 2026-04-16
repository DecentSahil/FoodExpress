package com.user.user_profile.dto;

import java.time.LocalDateTime;
import java.util.Map;

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

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public Map<String, String> getErrors() {
        return errors;
    }

    public void setErrors(Map<String, String> errors) {
        this.errors = errors;
    }
}
