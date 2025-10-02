package com.hehe.thesocial.dto.response.chat;


import com.hehe.thesocial.entity.FileDocument;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String id;

    String message;
    String sender;
    FileDocument fileDocument;
    String conversationId;
    LocalDateTime time;

    boolean isMe;
    boolean read;
}
