package com.hehe.thesocial.dto.request.chat;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DirectChatMessageRequest {
    @NotNull(message = "Receiver ID is required")
    @NotBlank(message = "Receiver ID cannot be blank")
    String receiverId;

    @NotNull(message = "Message is required")
    @NotBlank(message = "Message cannot be blank")
    String message;
}
