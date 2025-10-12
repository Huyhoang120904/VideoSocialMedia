package com.hehe.thesocial.service.kafka;

import com.hehe.thesocial.dto.event.ChatMessageEventDTO;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class KafkaProducer {
    KafkaTemplate<String, Object> kafkaTemplate;

    public void sendMessage(ChatMessageEventDTO chatMessageEventDTO) {
        kafkaTemplate.send("chat_messages",
                chatMessageEventDTO);
    }

}
