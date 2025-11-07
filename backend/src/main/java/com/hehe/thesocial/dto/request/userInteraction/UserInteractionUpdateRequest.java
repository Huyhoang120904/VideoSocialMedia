package com.hehe.thesocial.dto.request.userInteraction;

import com.hehe.thesocial.entity.enums.InteractionType;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import jakarta.validation.constraints.PositiveOrZero;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInteractionUpdateRequest {
    InteractionType interactionType;

    @PositiveOrZero(message = "Watch duration must be positive or zero")
    Double watchDuration; // in seconds

    @PositiveOrZero(message = "Watch percentage must be positive or zero")
    Double watchPercentage;

    Double interactionWeight;
}

