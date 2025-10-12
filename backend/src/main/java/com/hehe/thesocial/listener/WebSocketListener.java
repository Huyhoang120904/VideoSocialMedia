package com.hehe.thesocial.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.messaging.SessionConnectEvent;
import org.springframework.web.socket.messaging.SessionConnectedEvent;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;
import org.springframework.web.socket.messaging.SessionSubscribeEvent;

@Slf4j
@Component
public class WebSocketListener {
    /**
     * Handle the initial connection attempt (before STOMP connection is established)
     */
    @EventListener
    public void handleSessionConnect(SessionConnectEvent event) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
            log.info("WebSocket connect attempt - Session ID: {}", accessor.getSessionId());
            log.info("WebSocket connect attempt - Host: {}", accessor.getHost());
            
            // Log all headers for connection debugging
            log.info("===== WebSocket Connect Headers =====");
            accessor.getMessageHeaders().forEach((key, value) -> {
                log.info("Header: {} = {}", key, value);
            });
            
            // Log authentication details
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String tokenHeader = accessor.getFirstNativeHeader("token");
            log.info("Authorization header present: {}", authHeader != null);
            log.info("Token header present: {}", tokenHeader != null);
        } catch (Exception e) {
            log.error("Error in session connect handler", e);
        }
    }
    
    /**
     * Handle successful STOMP connection
     */
    @EventListener
    public void handleSocketConnection(SessionConnectedEvent event) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
            
            log.info("===== WebSocket Connected Successfully =====");
            log.info("WebSocket connection session ID: {}", accessor.getSessionId());
            log.info("WebSocket connection host IP: {}", accessor.getHost());
            
            // Log authentication method
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            String tokenHeader = accessor.getFirstNativeHeader("token");
            
            if (authHeader != null || tokenHeader != null) {
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                    log.info("Authentication method: Authorization Bearer header");
                } else if (tokenHeader != null) {
                    log.info("Authentication method: token header");
                }
                
                log.info("WebSocket connection authenticated");
            } else {
                log.info("WebSocket connection without authentication tokens");
            }
        } catch (Exception e) {
            // Never fail the connection due to errors in the listener
            log.error("Error processing WebSocket connection event: ", e);
        }
    }

    @EventListener
    public void handleSocketDisconnection(SessionDisconnectEvent event) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
            log.info("===== WebSocket Disconnected =====");

            // Get disconnect status
            CloseStatus closeStatus = event.getCloseStatus();
            if (closeStatus != null) {
                log.info("Close status: {} - {}", closeStatus.getCode(), closeStatus.getReason());
            }
            // Log principal if available
            if (accessor.getUser() != null) {
                log.info("Disconnected user: {}", accessor.getUser().getName());
            }
        } catch (Exception e) {
            log.error("Error in session disconnect handler", e);
        }
    }
    
    /**
     * Log subscription events to help debug message routing
     */
    @EventListener
    public void handleSubscription(SessionSubscribeEvent event) {
        try {
            StompHeaderAccessor accessor = StompHeaderAccessor.wrap(event.getMessage());
            log.info("===== Subscription =====");
            log.info("Session ID: {}", accessor.getSessionId());
            log.info("Destination: {}", accessor.getDestination());
            
            if (accessor.getUser() != null) {
                log.info("User: {}", accessor.getUser().getName());
            }
        } catch (Exception e) {
            log.error("Error in subscription handler", e);
        }
    }



}
