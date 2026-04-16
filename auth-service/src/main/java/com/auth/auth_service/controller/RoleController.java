package com.auth.auth_service.controller;


import com.auth.auth_service.service.impl.AuthServiceImpl;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class RoleController {
    private final AuthServiceImpl authService;

    public RoleController(AuthServiceImpl authService){
        this.authService = authService;

    }


    @GetMapping("/admin")
    public ResponseEntity<String> admin(){
        return ResponseEntity.ok("Admin Role");
    }
    @GetMapping("/user")
    public ResponseEntity<String> user(){
        return ResponseEntity.ok("User Role");
    }

}
