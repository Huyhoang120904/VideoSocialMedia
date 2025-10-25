package com.hehe.thesocial.service.messageDelivery;

import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.repository.ConversationRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class NewestMessageBroadcastService {
    
    SimpMessagingTemplate simpMessagingTemplate;
    ConversationRepository conversationRepository;
    UserDetailRepository userDetailRepository;

    /**
     * Broadcast newest chat message to all participants in a conversation
     * This service specifically handles broadcasting the latest message for inbox updates
     */
    public void broadcastNewestMessage(String conversationId, ChatMessageResponse message) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

            // Get all participants in the conversation
            Set<String> participantIds = conversation.getUserDetails().stream()
                    .map(UserDetail::getId)
                    .collect(Collectors.toSet());

            log.info("📢 Broadcasting newest message to {} participants in conversation {}", 
                    participantIds.size(), conversationId);

            // Create a broadcast message with conversation metadata
            NewestMessageBroadcast broadcast = NewestMessageBroadcast.builder()
                    .conversationId(conversationId)
                    .message(message)
                    .conversationType(conversation.getConversationType().name())
                    .participantCount(participantIds.size())
                    .timestamp(System.currentTimeMillis())
                    .build();

            // Send to all participants using the newest-message destination
            for (String participantId : participantIds) {
                try {
                    String destination = "/queue/newest-message";
                    simpMessagingTemplate.convertAndSendToUser(participantId, destination, broadcast);
                    log.debug("✅ Newest message broadcasted to participant: {}", participantId);
                } catch (Exception e) {
                    log.warn("⚠️ Failed to broadcast newest message to participant {}: {}", participantId, e.getMessage());
                    // Continue with other participants even if one fails
                }
            }

            log.info("📢 Newest message broadcast completed for conversation {}", conversationId);
        } catch (Exception e) {
            log.error("❌ Error broadcasting newest message to conversation {}: {}", conversationId, e.getMessage());
        }
    }

    /**
     * Broadcast newest message to specific users (for direct messages)
     */
    public void broadcastNewestMessageToUsers(List<String> userIds, String conversationId, ChatMessageResponse message) {
        try {
            log.info("📢 Broadcasting newest message to {} specific users in conversation {}", 
                    userIds.size(), conversationId);

            NewestMessageBroadcast broadcast = NewestMessageBroadcast.builder()
                    .conversationId(conversationId)
                    .message(message)
                    .timestamp(System.currentTimeMillis())
                    .build();

            // Send to specific users
            for (String userId : userIds) {
                try {
                    String destination = "/queue/newest-message";
                    simpMessagingTemplate.convertAndSendToUser(userId, destination, broadcast);
                    log.debug("✅ Newest message broadcasted to user: {}", userId);
                } catch (Exception e) {
                    log.warn("⚠️ Failed to broadcast newest message to user {}: {}", userId, e.getMessage());
                }
            }

            log.info("📢 Newest message broadcast to specific users completed");
        } catch (Exception e) {
            log.error("❌ Error broadcasting newest message to specific users: {}", e.getMessage());
        }
    }

    /**
     * Check if a user is currently online and subscribed to WebSocket
     */
    public boolean isUserOnline(String userId) {
        // For now, we'll assume all users are potentially online
        // In a production system, you'd check against a session store or Redis
        return true;
    }

    /**
     * Get offline users for a conversation
     */
    public List<String> getOfflineUsers(String conversationId) {
        // For now, return empty list - in production you'd check actual online status
        return List.of();
    }

    /**
     * Inner class for newest message broadcast data
     */
    @lombok.Builder
    @lombok.Data
    public static class NewestMessageBroadcast {
        private String conversationId;
        private ChatMessageResponse message;
        private String conversationType;
        private Integer participantCount;
        private Long timestamp;
    }
}
