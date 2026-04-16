//package com.auth.auth_service.security;
//
//import io.jsonwebtoken.Claims;
//import jakarta.servlet.FilterChain;
//import jakarta.servlet.ServletException;
//import jakarta.servlet.http.HttpServletRequest;
//import jakarta.servlet.http.HttpServletResponse;
//import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
//import org.springframework.security.core.authority.SimpleGrantedAuthority;
//import org.springframework.security.core.context.SecurityContextHolder;
//import org.springframework.web.filter.OncePerRequestFilter;
//
//import java.io.IOException;
//import java.util.List;
//import java.util.SimpleTimeZone;
//
//public class JwtAuthenticationFilter extends OncePerRequestFilter {
//    @Override
//    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
//        String header = request.getHeader("Authorization");
//        if(header==null || !header.startsWith("Bearer")){
//            filterChain.doFilter(request,response);
//            return;
//        }
//
//        String token = header.substring(7);
//
//
//
//
//        try{
//            Claims claims = JwtUtil.parseToken(token);
//            String email = claims.getSubject();
//            String role = claims.get("role",String.class);
//
//            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(email,null, List.of(new SimpleGrantedAuthority(role)));
//            SecurityContextHolder.getContext().setAuthentication(authentication);
//
//        }catch (Exception e){
//            SecurityContextHolder.clearContext();
//        }
//        filterChain.doFilter(request,response);
//
//
//    }
//}
