package com.hehe.thesocial.dto.request.chat;

import com.hehe.thesocial.entity.enums.ChatMessageType;
import jakarta.validation.constraints.AssertTrue;
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

    String message;

    ChatMessageType messageType;

    String fileId;

    String feedItemId;

    @AssertTrue(message = "Either message text or fileId must be provided")
    public boolean isValidPayload() {
        return (message != null && !message.isBlank()) || (fileId != null && !fileId.isBlank());
    }

}
