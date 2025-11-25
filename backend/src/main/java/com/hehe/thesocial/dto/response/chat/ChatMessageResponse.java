package com.hehe.thesocial.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.file.FileResponse;
import com.hehe.thesocial.entity.enums.ChatMessageType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    String id;
    String conversationId;
    String sender;
    String senderId;
    String message;
    LocalDateTime createdAt;
    Boolean edited;
    FileResponse avatar;
    java.util.List<String> readParticipantsId;
    Boolean isReadByCurrentUser;
    Integer readCount;
    ChatMessageType messageType;
    FileResponse file;
    String feedItemId;
}
