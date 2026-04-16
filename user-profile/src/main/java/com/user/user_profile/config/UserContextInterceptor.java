//package com.user.user_profile.config;
//
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.stereotype.Component;
//import org.springframework.web.servlet.HandlerInterceptor;
//
//@Component
//public class UserContextInterceptor implements HandlerInterceptor {
//
//    private final UserContext userContext;
//
//    public UserContextInterceptor(UserContext userContext) {
//        this.userContext = userContext;
//    }
//
//    @Override
//    public boolean preHandle(
//            HttpServletRequest request,
//            HttpServletResponse response,
//            Object handler
//    ) {
//
//        String email = request.getHeader("X-User-Email");
//        String role = request.getHeader("X-User-Role");
//
//        if (email != null) {
//            userContext.setEmail(email);
//            userContext.setRole(role);
//        }
//
//        return true;
//    }
//}
