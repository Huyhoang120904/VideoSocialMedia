package com.hehe.thesocial.dto.request.aiChat;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO for AI chat messages.
 * Simplified compared to DirectChatMessageRequest as receiverId is always the AI system.
 */
@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiChatMessageRequest {
    @NotBlank(message = "Message text is required")
    String message;
}

