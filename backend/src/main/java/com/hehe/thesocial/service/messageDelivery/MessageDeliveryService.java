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
public class MessageDeliveryService {
    SimpMessagingTemplate simpMessagingTemplate;
    ConversationRepository conversationRepository;
    UserDetailRepository userDetailRepository;

    /**
     * Deliver message to all participants in a conversation
     * This method ensures messages reach users even if they're not actively viewing the conversation
     */
    public void deliverMessageToConversation(String conversationId, ChatMessageResponse message) {
        try {
            Conversation conversation = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new RuntimeException("Conversation not found: " + conversationId));

            String destination = "/queue/chat";
            Set<String> participantIds = conversation.getUserDetails().stream()
                    .map(UserDetail::getId)
                    .collect(Collectors.toSet());

            log.info("📨 Delivering message to {} participants in conversation {}", 
                    participantIds.size(), conversationId);

            // Send to all participants regardless of their online status
            for (String participantId : participantIds) {
                try {
                    simpMessagingTemplate.convertAndSendToUser(participantId, destination, message);
                    log.debug("✅ Message delivered to participant: {}", participantId);
                } catch (Exception e) {
                    log.warn("⚠️ Failed to deliver message to participant {}: {}", participantId, e.getMessage());
                    // Continue with other participants even if one fails
                }
            }

            log.info("📨 Message delivery completed for conversation {}", conversationId);
        } catch (Exception e) {
            log.error("❌ Error delivering message to conversation {}: {}", conversationId, e.getMessage());
        }
    }

    /**
     * Check if a user is currently online and subscribed to WebSocket
     * This is a simplified check - in production you might want to use Redis or a session store
     */
    public boolean isUserOnline(String userId) {
        // For now, we'll assume all users are potentially online
        // In a production system, you'd check against a session store or Redis
        return true;
    }

    /**
     * Get offline users for a conversation
     * This method can be enhanced to check actual online status
     */
    public List<String> getOfflineUsers(String conversationId) {
        // For now, return empty list - in production you'd check actual online status
        // This could be implemented using Redis session store or database
        return List.of();
    }
}
