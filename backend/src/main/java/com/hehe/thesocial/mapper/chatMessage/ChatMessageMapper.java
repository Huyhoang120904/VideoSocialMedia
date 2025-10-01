package com.hehe.thesocial.mapper.chatMessage;

import com.hehe.thesocial.dto.request.chat.ChatMessageCreationRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.ChatMessage;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

@Mapper(componentModel = "spring")
public interface ChatMessageMapper {
    ChatMessage toChatMessage(ChatMessageCreationRequest request);

    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);
}
