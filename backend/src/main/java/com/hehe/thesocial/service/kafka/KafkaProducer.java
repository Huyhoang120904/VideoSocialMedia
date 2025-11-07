package com.hehe.thesocial.service.kafka;

import com.hehe.thesocial.dto.event.ChatMessageEventDTO;
import com.hehe.thesocial.dto.event.ReadStatusEventDTO;
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

    public void sendReadStatusUpdate(ReadStatusEventDTO readStatusEventDTO) {
        kafkaTemplate.send("read_status_updates",
                readStatusEventDTO);
    }

//    public void love_comment(String userDetailId, String feedItemId) {
//        kafkaTemplate.send("read_status_updates",...);
//    }

//    public void love_feedItem(String userDetailId, String feedItemId) {
//        kafkaTemplate.send("read_status_updates",...);
//    }

//    public void view_feedItem(String userDetailId, String feedItemId) {
//        kafkaTemplate.send("read_status_updates",...);
//    }

//    public void comment_feedItem(String userDetailId,Comment comment ,String feedItemId, String feedItem) {
//        kafkaTemplate.send("read_status_updates",...);
//    }

}
