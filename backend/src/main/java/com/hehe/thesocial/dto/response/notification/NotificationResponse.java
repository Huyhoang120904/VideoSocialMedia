package com.hehe.thesocial.dto.response.notification;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.entity.enums.NotificationType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class NotificationResponse {
    String id;
    NotificationType notificationType;
    String title;
    String body;
    String previewText;
    String feedItemId;
    String commentId;
    String conversationId;
    String messageId;
    boolean read;
    Instant createdAt;
    Instant readAt;
    NotificationActorResponse actor;
}








