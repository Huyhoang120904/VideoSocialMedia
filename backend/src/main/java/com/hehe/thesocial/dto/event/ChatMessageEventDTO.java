package com.hehe.thesocial.dto.event;

import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.enums.EventType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatMessageEventDTO {
    ChatMessageResponse response;
    Set<String> participantsIds;
    EventType eventType;
}
