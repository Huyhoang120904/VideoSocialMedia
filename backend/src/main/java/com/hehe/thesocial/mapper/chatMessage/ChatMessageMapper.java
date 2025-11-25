package com.hehe.thesocial.mapper.chatMessage;

import com.hehe.thesocial.dto.request.chat.DirectChatMessageRequest;
import com.hehe.thesocial.dto.response.chat.ChatMessageResponse;
import com.hehe.thesocial.entity.ChatMessage;
import com.hehe.thesocial.mapper.file.FileMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        uses = {FileMapper.class},
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ChatMessageMapper {

    ChatMessage toChatMessage(DirectChatMessageRequest request);

    @Mapping(source = "senderId", target = "sender")
    @Mapping(source = "fileDocument", target = "file")
    ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage);
}
