package com.hehe.thesocial.mapper.conversation;

import com.hehe.thesocial.dto.request.conversation.ConversationRequest;
import com.hehe.thesocial.dto.response.conversation.ConversationListResponse;
import com.hehe.thesocial.dto.response.conversation.ConversationResponse;
import com.hehe.thesocial.entity.Conversation;
import com.hehe.thesocial.entity.UserDetail;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ConversationMapper {
    ConversationListResponse toConversationListResponse(Conversation conversation);

    @Mapping(target = "participantIds", source = "userDetails", qualifiedByName = "mapUserDetailsToParticipantIds")
    ConversationResponse toConversationResponse(Conversation conversation);

    Conversation toConversation(ConversationRequest request);

    @Named("mapUserDetailsToParticipantIds")
    default List<String> mapUserDetailsToParticipantIds(Set<UserDetail> userDetails) {
        if (userDetails == null) {
            return null;
        }
        return userDetails.stream()
                .map(UserDetail::getId)
                .collect(Collectors.toList());
    }
}
