package com.hehe.thesocial.service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hehe.thesocial.dto.event.ChatMessageEventDTO;
import com.hehe.thesocial.entity.UserDetail;
import com.hehe.thesocial.exception.AppException;
import com.hehe.thesocial.exception.ErrorCode;
import com.hehe.thesocial.repository.UserDetailRepository;
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
    private final UserDetailRepository userDetailRepository;

    @KafkaListener(topics = "chat_messages", groupId = "social-group")
    public void listenConversations(ChatMessageEventDTO chatMessageEventDTO) throws JsonProcessingException {
        log.info("📩 Broadcasting message to {} participants", chatMessageEventDTO.getParticipantsIds().size());
        try {
            // Send notifications to all participants (including sender for testing)
            for (String participantId : chatMessageEventDTO.getParticipantsIds()) {
                String destination = "/queue/chat";

                UserDetail userDetail = userDetailRepository.findById(participantId)
                        .orElseThrow(() -> new AppException(ErrorCode.UNAUTHENTICATED));

                // Use UserDetail ID for WebSocket routing (same as in JwtHandshakeInterceptor)
                simpMessagingTemplate.convertAndSendToUser(userDetail.getId(), destination,
                        chatMessageEventDTO.getResponse());
            }
            log.info("✅ Message broadcasted successfully");
        } catch (Exception ex) {
            log.error("❌ Error broadcasting message: {}", ex.getMessage());
        }
    }
}
