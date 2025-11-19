package com.hehe.thesocial.dto.response.userInteraction;

import com.hehe.thesocial.entity.enums.InteractionType;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInteractionResponse {
    String id;
    String userDetailId;
    String feedItemId;
    InteractionType interactionType;
    Double watchDuration;
    Double watchPercentage;
    Double interactionWeight;
    LocalDateTime createdAt;
}

