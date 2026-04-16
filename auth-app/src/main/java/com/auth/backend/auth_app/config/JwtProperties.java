package com.auth.backend.auth_app.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@ConfigurationProperties(prefix = "security.jwt")
@Component
@Getter
@Setter
public class JwtProperties {

    private String secret;
    private String issuer;
    private long accessTtlSeconds;
    private long refreshTtlSeconds;
    private String refreshTokenCookieName;
    private boolean cookieSecure;
    private boolean cookieHttpOnly;
    private String cookieSameSite;
    private String cookieDomain;


}
