package com.hehe.thesocial.service.kafka;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
public class KafkaConsumer {
    ObjectMapper objectMapper;
    SimpMessagingTemplate simpMessagingTemplate;

    @KafkaListener(topics = "chat_messages", groupId = "social-group")
    public void listenConversations(ChatMessageResponse chatMessageResponse) throws JsonProcessingException {
        String id = SecurityContextHolder.getContext().getAuthentication().getName();

        log.info("User id : {}", id);
//        simpMessagingTemplate.convertAndSendToUser();
        log.info("\uD83D\uDCE9 Message from {}: {}", chatMessageResponse.getConversationId(), chatMessageResponse);
    }


}
