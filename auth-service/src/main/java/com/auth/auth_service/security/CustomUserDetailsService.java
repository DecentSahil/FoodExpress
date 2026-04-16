//package com.auth.auth_service.security;
//
//import com.auth.auth_service.entity.AuthUser;
//import com.auth.auth_service.repository.AuthUserRepository;
//import org.springframework.security.core.userdetails.UserDetails;
//import org.springframework.security.core.userdetails.UserDetailsService;
//import org.springframework.security.core.userdetails.UsernameNotFoundException;
//import org.springframework.stereotype.Service;
//
//@Service
//public class CustomUserDetailsService implements UserDetailsService {
//    private final AuthUserRepository authUserRepository;
//
//    public CustomUserDetailsService(AuthUserRepository authUserRepository) {
//        this.authUserRepository = authUserRepository;
//    }
//    @Override
//    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
//        AuthUser user = authUserRepository.findByEmail(username).orElseThrow(() -> new UsernameNotFoundException("Invalid Username or Password"));
//        return new CustomUserDetails(user);
//    }
//}
