package com.auth.backend.auth_app.security;


import com.auth.backend.auth_app.config.JwtProperties;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

@Service
@Getter
public class CookieService {

    private final String refreshTokenCookieName;
    private final boolean cookieHttpOnly;
    private final boolean cookieSecure;
    private final String cookieDomain;
    private final String cookieSameSite;

    public CookieService(JwtProperties props) {
        this.refreshTokenCookieName = props.getRefreshTokenCookieName();
        this.cookieHttpOnly = props.isCookieHttpOnly();
        this.cookieSecure = props.isCookieSecure();
        this.cookieDomain = props.getCookieDomain();
        this.cookieSameSite = props.getCookieSameSite();
    }

    public void attachRefreshCookie(
            HttpServletResponse response,
            String value,
            int maxAge
    ) {
        var responseCookieBuilder =
                ResponseCookie.from(refreshTokenCookieName, value)
                        .httpOnly(cookieHttpOnly)
                        .secure(cookieSecure)
                        .path("/")
                        .maxAge(maxAge)
                        .sameSite(cookieSameSite);

        if (cookieDomain != null) {
            responseCookieBuilder.domain(cookieDomain);
        }

        ResponseCookie responseCookie = responseCookieBuilder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());
    }

    public void clearRefreshCookie(HttpServletResponse response) {

        var builder = ResponseCookie.from(refreshTokenCookieName, "")
                .maxAge(0)
                .httpOnly(cookieHttpOnly)
                .path("/")
                .sameSite(cookieSameSite)
                .secure(cookieSecure);

        if (cookieDomain != null && !cookieDomain.isBlank()) {
            builder.domain(cookieDomain);
        }

        ResponseCookie responseCookie = builder.build();

        response.addHeader(HttpHeaders.SET_COOKIE, responseCookie.toString());
    }

    public void addNoStoreHeaders(HttpServletResponse response) {
        response.setHeader(HttpHeaders.CACHE_CONTROL, "no-store");
        response.setHeader("Pragma", "no-cache");
    }



}
