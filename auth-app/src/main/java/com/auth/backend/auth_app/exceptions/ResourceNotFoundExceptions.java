package com.auth.backend.auth_app.exceptions;

public class ResourceNotFoundExceptions extends RuntimeException{
    public ResourceNotFoundExceptions(String message){
        super(message);
    }
    public ResourceNotFoundExceptions(){
        super("Resource not found");
    }
}
