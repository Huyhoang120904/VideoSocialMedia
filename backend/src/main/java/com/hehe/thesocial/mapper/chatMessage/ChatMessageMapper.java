package com.hehe.thesocial.mapper.chatMessage;

import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.ChatMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ChatMessageMapper {

    ChatMessage toChatMessage(DirectChatMessageRequest request);

    @Mapping(source = "senderId", target = "sender")
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);
}
