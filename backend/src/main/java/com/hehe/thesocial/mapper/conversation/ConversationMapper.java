package com.hehe.thesocial.mapper.conversation;

import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
import com.hehe.thesocial.dto.response.conversation.ConversationListResponse;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.entity.Conversation;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    ConversationListResponse toConversationListResponse(Conversation conversation);
    ConversationResponse toConversationResponse(Conversation conversation);

    Conversation toConversation(ConversationRequest request);
}
