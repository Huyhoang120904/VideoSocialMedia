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
public class GroupChatMessageRequest {
    @NotNull(message = "Group ID is required")
    @NotBlank(message = "Group ID cannot be blank")
    String groupId;

    @NotNull(message = "Message is required")
    @NotBlank(message = "Message cannot be blank")
    String message;
}
