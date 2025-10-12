package com.hehe.thesocial.dto.response.chat;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChatMessageResponse {
    String id;
    String conversationId;
    String sender;
    String message;
    LocalDateTime time;
    Boolean edited;
}
