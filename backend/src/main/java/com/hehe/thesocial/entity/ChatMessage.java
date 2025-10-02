package com.hehe.thesocial.entity;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;
import java.util.List;

@Document("chat_messages")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessage {
    @MongoId
    String id;

    String message;
    String sender;
    FileDocument fileDocument;
    String conversationId;
    LocalDateTime time;

    boolean edited;

    List<String> readParticipantsId;
}
