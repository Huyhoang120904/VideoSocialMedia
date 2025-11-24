package com.hehe.thesocial.config;

import com.hehe.thesocial.dto.request.auth.IntrospectRequest;
import com.hehe.thesocial.dto.response.auth.IntrospectResponse;
import com.hehe.thesocial.entity.User;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.repository.UserRepository;
import com.hehe.thesocial.service.authentication.AuthenticationService;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.server.HandshakeInterceptor;
import org.springframework.web.util.UriComponentsBuilder;

import java.security.Principal;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class JwtHandshakeInterceptor implements HandshakeInterceptor {
    AuthenticationService authenticationService;
    UserRepository userRepository;
    UserDetailRepository userDetailRepository;

    @Override
    public boolean beforeHandshake(ServerHttpRequest request, ServerHttpResponse response,
                                   WebSocketHandler wsHandler, Map<String, Object> attributes) throws Exception {
        try {
            // Extract token from query parameters or headers
            String token = extractToken(request);
            if (token == null) {
                log.warn("No JWT token found in WebSocket handshake");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            // Validate token using your existing authentication service
            IntrospectResponse introspectResponse = authenticationService.introspectToken(
                    IntrospectRequest.builder().token(token).build());

            if (!introspectResponse.isValid()) {
                log.warn("Invalid JWT token in WebSocket handshake");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            String userId = introspectResponse.getUserId();
            if (userId == null) {
                log.warn("Token is valid but subject is missing");
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            // Get UserDetail from database
            User user = userRepository.findById(userId).orElse(null);
            if (user == null) {
                log.warn("User not found for ID: {}", userId);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            UserDetail userDetail = userDetailRepository.findByUser(user).orElse(null);
            if (userDetail == null) {
                log.warn("UserDetail not found for user ID: {}", userId);
                response.setStatusCode(HttpStatus.UNAUTHORIZED);
                return false;
            }

            // Store UserDetailId as principal for the WebSocket session
            attributes.put("userDetailId", userDetail.getId());
            attributes.put("principal", new UserDetailPrincipal(userDetail.getId()));

            log.info("WebSocket handshake successful for UserDetail ID: {}", userDetail.getId());
            return true;
        } catch (Exception e) {
            log.error("Error during WebSocket handshake: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public void afterHandshake(ServerHttpRequest request, ServerHttpResponse response,
                               WebSocketHandler wsHandler, Exception exception) {
        if (exception != null) {
            log.error("WebSocket handshake failed: {}", exception.getMessage());
        }
    }

    private String extractToken(ServerHttpRequest request) {
        // Try to get token from query parameter first
        String token = UriComponentsBuilder.fromUri(request.getURI())
                .build()
                .getQueryParams()
                .getFirst("token");

        if (token != null) {
            return token;
        }

        // Try to get token from Authorization header
        String authHeader = request.getHeaders().getFirst("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }

        return null;
    }

    // Simple Principal implementation for UserDetail ID
    @Getter
    public static class UserDetailPrincipal implements Principal {
        private final String userDetailId;

        public UserDetailPrincipal(String userDetailId) {
            this.userDetailId = userDetailId;
        }

        @Override
        public String getName() {
            return userDetailId;
        }
    }
}
