package com.auth.auth_service.feign;


import com.auth.auth_service.dto.UserDetails;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient("USER-SERVICE")
public interface UserClient {


    @PostMapping("user/internal/details")
    void registrationDetails(@RequestBody UserDetails userDetails);
}
