package com.hehe.thesocial.service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hehe.thesocial.dto.event.ChatMessageEventDTO;
import com.hehe.thesocial.dto.event.ReadStatusEventDTO;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.ConversationRepository;
import com.hehe.thesocial.repository.UserDetailRepository;
import com.hehe.thesocial.service.messageDelivery.MessageDeliveryService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {
    ObjectMapper objectMapper;
    SimpMessagingTemplate simpMessagingTemplate;
    UserDetailRepository userDetailRepository;
    ConversationRepository conversationRepository;
    MessageDeliveryService messageDeliveryService;

    @KafkaListener(topics = "chat_messages", groupId = "social-group")
    public void listenConversations(ChatMessageEventDTO chatMessageEventDTO) throws JsonProcessingException {
        log.info("📩 Broadcasting message to {} participants", chatMessageEventDTO.getParticipantsIds().size());
        try {
            // Use the message delivery service to ensure all participants receive the message
            // This handles both online and offline users
            messageDeliveryService.deliverMessageToConversation(
                chatMessageEventDTO.getResponse().getConversationId(), 
                chatMessageEventDTO.getResponse()
            );
            
            log.info("✅ Message broadcasted successfully");
        } catch (Exception ex) {
            log.error("❌ Error broadcasting message: {}", ex.getMessage());
        }
    }

    @KafkaListener(topics = "read_status_updates", groupId = "social-group")
    public void listenReadStatusUpdates(ReadStatusEventDTO readStatusEventDTO) throws JsonProcessingException {
        log.info("📖 Broadcasting read status update for message {} to conversation {}", 
                readStatusEventDTO.getMessageId(), readStatusEventDTO.getConversationId());
        try {
            // Get all participants in the conversation
            Conversation conversation = conversationRepository.findById(readStatusEventDTO.getConversationId())
                    .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
            
            String destination = "/queue/read-status";
            java.util.List<String> failedUsers = new java.util.ArrayList<>();
            int successCount = 0;
            
            // Send read status update to all conversation participants
            for (UserDetail participant : conversation.getUserDetails()) {
                try {
                    simpMessagingTemplate.convertAndSendToUser(participant.getId(), destination, readStatusEventDTO);
                    successCount++;
                } catch (Exception e) {
                    log.error("Failed to send read status to user {}: {}", participant.getId(), e.getMessage());
                    failedUsers.add(participant.getId());
                }
            }
            
            if (!failedUsers.isEmpty()) {
                log.warn("Failed to send read status to {} users: {}", failedUsers.size(), failedUsers);
            }
            
            log.info("✅ Read status update broadcasted successfully to {} out of {} participants", 
                    successCount, conversation.getUserDetails().size());
        } catch (Exception ex) {
            log.error("❌ Error broadcasting read status update: {}", ex.getMessage());
            // Consider implementing dead letter queue or retry mechanism for critical failures
        }
    }
}
