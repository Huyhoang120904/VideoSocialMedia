package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.NotificationType;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;

@Document(collection = "notifications")
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Notification extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("recipient_id")
    String recipientId;

    @Field("actor_id")
    String actorId;

    @Field("notification_type")
    NotificationType notificationType;

    @Field("title")
    String title;

    @Field("body")
    String body;

    @Field("preview_text")
    String previewText;

    @Field("feed_item_id")
    String feedItemId;

    @Field("comment_id")
    String commentId;

    @Field("conversation_id")
    String conversationId;

    @Field("message_id")
    String messageId;

    @Field("is_read")
    @Builder.Default
    boolean read = false;

    @Field("read_at")
    LocalDateTime readAt;
}





