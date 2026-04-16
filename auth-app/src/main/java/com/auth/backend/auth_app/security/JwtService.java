package com.auth.backend.auth_app.security;


import com.auth.backend.auth_app.config.JwtProperties;
import com.auth.backend.auth_app.entities.User;
import com.auth.backend.auth_app.entities.Role;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.Getter;
import org.springframework.stereotype.Service;
import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@Getter
public class JwtService {

    private final SecretKey key;
    private final long accessTtlSeconds;
    private final long refreshTtlSeconds;
    private final String issuer;


//            @Value("${JWT_SECRET}") String secret,
//            @Value("${JWT_ACCESS_TTL_SECONDS}") long accessTtlSeconds,
//            @Value("${JWT_REFRESH_TTL_SECONDS}") long refreshTtlSeconds,
//            @Value("${JWT_ISSUER}") String issuer
    public JwtService(JwtProperties props) {
        if(props.getSecret()==null || props.getSecret().length()<64){
            throw new IllegalArgumentException("Invalid key");
        }
        this.key = Keys.hmacShaKeyFor(props.getSecret().getBytes(StandardCharsets.UTF_8));
        this.issuer = props.getIssuer();
        this.accessTtlSeconds = props.getAccessTtlSeconds();
        this.refreshTtlSeconds = props.getRefreshTtlSeconds();
    }



    public String generateAccessToken(User user) {
        Instant now = Instant.now();

        List<String> roles = user.getRoles() == null
                ? List.of()
                : user.getRoles()
                .stream()
                .map(Role::getName)
                .toList();

        return Jwts.builder()
                .id(UUID.randomUUID().toString())
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(accessTtlSeconds)))
                .claims(Map.of(
                        "email", user.getEmail(),
                        "roles", roles,
                        "typ", "access"
                ))
                .signWith(key,SignatureAlgorithm.HS512 )
                .compact();
    }

    // Generate refresh token
    public String generateRefreshToken(User user, String jti) {
        Instant now = Instant.now();

        return Jwts.builder()
                .id(jti)
                .subject(user.getId().toString())
                .issuer(issuer)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(refreshTtlSeconds)))
                .claim("typ", "refresh")
                .signWith(key,SignatureAlgorithm.HS512)
                .compact();
    }

    // Parse the token
    public Jws<Claims> parse(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);

    }

    // Check if token is an access token
    public boolean isAccessToken(String token) {
        Claims claims = parse(token).getPayload();
        return "access".equals(claims.get("typ"));
    }

    public boolean isRefreshToken(String token) {
        Claims claims = parse(token).getPayload();
        return "refresh".equals(claims.get("typ"));
    }

    public UUID getUserId(String token) {
        Claims claims = parse(token).getPayload();
        return UUID.fromString(claims.getSubject());
    }

    public String getJti(String token) {
        return parse(token).getPayload().getId();
    }

    public List<String> getRoles(String token) {
        Claims claims = parse(token).getPayload();

        Object roles = claims.get("roles");
        if (roles instanceof List<?>) {
            return ((List<?>) roles)
                    .stream()
                    .map(String::valueOf)
                    .toList();
        }

        return List.of();
    }

    public String getEmail(String token) {
        Claims claims = parse(token).getPayload();
        return (String) claims.get("email");
    }




}
