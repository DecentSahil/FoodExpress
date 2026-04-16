package com.auth.auth_service.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.UUID;

public class JwtUtil {

    private static final String SECRET =
            "my_super_secret_key_which_is_long_enough_for_hs256";

    private static final long EXPIRATION_TIME = 1000 * 60 * 60 * 24 * 20;

    private static final Key key = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public static String generateToken(String id, String email, String role, UUID restaurantId) {

        var builder = Jwts.builder()
                .setSubject(email)
                .setId(id)
                .claim("role", role)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME));

        if (restaurantId != null) {
            builder.claim("restaurantId", restaurantId.toString());
        }

        return builder
                .signWith(key)
                .compact();
    }

    public static Claims parseToken(String token) {
        Jws<Claims> jws = Jwts.parser()
                .verifyWith((SecretKey) key)
                .build()
                .parseSignedClaims(token);
        return jws.getPayload();
    }
}
