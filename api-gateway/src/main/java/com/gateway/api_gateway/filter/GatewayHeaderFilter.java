package com.gateway.api_gateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.security.core.context.ReactiveSecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

import java.util.Map;

@Component
public class GatewayHeaderFilter implements GlobalFilter, Ordered {
    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        return ReactiveSecurityContextHolder.getContext()
                .map(ctx -> ctx.getAuthentication())
                .flatMap(auth -> {

                    String email = auth.getName();
                    String role = auth.getAuthorities()
                            .iterator().next().getAuthority();
                    @SuppressWarnings("unchecked")
                    Map<String, String> details =
                            (Map<String, String>) auth.getDetails();

                    String userId = details.get("userId");
                    String restaurantId = details.get("restaurantId");
                    System.out.println(email);

                    ServerWebExchange mutatedExchange = exchange.mutate()
                            .request(r -> {
                                r.header("X-User-Email", email);
                                r.header("X-User-Role", role);
                                r.header("X-Auth-User-Id", userId);
                                if (restaurantId != null) {
                                    r.header("X-Restaurant-Id", restaurantId);
                                }
                            })
                            .build();

                    return chain.filter(mutatedExchange);
                })
                .switchIfEmpty(chain.filter(exchange));
    }

    @Override
    public int getOrder() {
        return -1;
    }
}
