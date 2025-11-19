package com.hehe.thesocial.dto.request.userInteraction;

import jakarta.validation.constraints.PositiveOrZero;
import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserInteractionRequest {
    String feedItemId;
    String userDetailId;
    @PositiveOrZero(message = "Watch duration must be positive or zero")
    Double watchDuration; // in seconds
}

