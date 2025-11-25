package com.hehe.thesocial.dto.response.userInteraction;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.hehe.thesocial.entity.enums.InteractionType;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInteractionResponse {
    String id;

    @JsonProperty("userId")
    String userDetailId;

    String feedItemId;
    InteractionType interactionType;

    @JsonProperty("duration")
    Double watchDuration;

    Double watchPercentage;
    Double interactionWeight;

    @JsonProperty("timestamp")
    LocalDateTime createdAt;
}

