package com.user.user_profile.feign;


import com.user.user_profile.dto.RegisterRequest;
import com.user.user_profile.service.UserService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("user/internal")
public class UserValidationController {

    private final UserService userService;

    UserValidationController(UserService userService){
        this.userService = userService;
    }

    @PostMapping("/details")
    public void registrationDetails(@RequestBody RegisterRequest registerRequest){
        userService.createUser(registerRequest);
    }
}
