package com.hehe.thesocial.service.kafka;

import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
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
//    SimpMessagingTemplate simpMessagingTemplate;
    @KafkaListener(topics = "chat_messages", groupId = "social-group")
    public void listenConversations(ChatMessageResponse chatMessageResponse) {
//        simpMessagingTemplate.convertAndSendToUser(chatMess);
        log.info("\uD83D\uDCE9 Message from {}: {}", chatMessageResponse.getConversationId(), chatMessageResponse);
    }


}
