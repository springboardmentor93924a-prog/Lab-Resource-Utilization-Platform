package com.example.lab_platform.config;

import com.example.lab_platform.security.JwtService;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.socket.server.support.DefaultHandshakeHandler;

import java.security.Principal;
import java.util.Map;

/*
 * Real-time notification push over STOMP/WebSocket, replacing
 * frontend polling. Auth happens at handshake time: the frontend
 * connects to /ws?token=<jwt>, we validate it here (same JwtService
 * used for REST) and bind the user's email as the STOMP Principal,
 * so NotificationServiceImpl can push to that exact user only via
 * convertAndSendToUser(email, "/queue/notifications", payload).
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final JwtService jwtService;

    public WebSocketConfig(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins("http://localhost:5173")
                .setHandshakeHandler(new DefaultHandshakeHandler() {
                    @Override
                    protected Principal determineUser(ServerHttpRequest request,
                            WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        String email = (String) attributes.get("email");
                        // Principal is a functional interface — getName() = email
                        return email == null ? null : () -> email;
                    }
                })
                .addInterceptors(new HandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                            WebSocketHandler wsHandler, Map<String, Object> attributes) {
                        String query = request.getURI().getQuery();
                        String token = extractToken(query);

                        // EDGE CASE: no/blank token — reject the handshake outright
                        if (token == null || token.isBlank()) {
                            return false;
                        }

                        try {
                            String email = jwtService.extractEmail(token);
                            // EDGE CASE: token parses but has no subject/email — reject
                            if (email == null || email.isBlank()) {
                                return false;
                            }
                            attributes.put("email", email);
                            return true;
                        } catch (Exception e) {
                            // EDGE CASE: expired/malformed/tampered token — reject, don't 500
                            return false;
                        }
                    }

                    @Override
                    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                            WebSocketHandler wsHandler, Exception exception) {
                    }

                    private String extractToken(String query) {
                        if (query == null) return null;
                        for (String param : query.split("&")) {
                            String[] kv = param.split("=", 2);
                            if (kv.length == 2 && kv[0].equals("token")) {
                                return kv[1];
                            }
                        }
                        return null;
                    }
                })
                .withSockJS(); // EDGE CASE: falls back gracefully if raw WS is blocked by a proxy/firewall
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user"); // required for convertAndSendToUser
    }
}