package com.hehe.thesocial.mapper.userInteraction;

import com.hehe.thesocial.dto.request.userInteraction.UserInteractionRequest;
import com.hehe.thesocial.dto.response.userInteraction.UserInteractionResponse;
import com.hehe.thesocial.entity.UserInteraction;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserInteractionMapper {
    UserInteraction toUserInteraction(UserInteractionRequest request);

    UserInteractionResponse toUserInteractionResponse(UserInteraction userInteraction);

    void updateUserInteractionFromRequest(UserInteractionRequest request, @MappingTarget UserInteraction userInteraction);
}

