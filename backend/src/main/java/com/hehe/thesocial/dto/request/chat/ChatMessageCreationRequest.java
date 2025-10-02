package com.hehe.thesocial.dto.request.chat;

import com.hehe.thesocial.entity.FileDocument;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageCreationRequest {
    String message;
    FileDocument fileDocument;
    String conversationId;
}
