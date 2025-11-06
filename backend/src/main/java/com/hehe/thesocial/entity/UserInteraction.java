package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.InteractionType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;

@Document(collection = "user_interaction")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class UserInteraction {
    @MongoId
    @Field("_id")
    String id;

    @Indexed
    @Field("user_id")
    String userId;

    @Indexed
    @Field("feed_item_id")
    String feedItemId;

    @Field("interaction_type")
    InteractionType interactionType;

    @Field("watch_duration")
    Double watchDuration; // in seconds

    @Field("watch_percentage")
    Double watchPercentage;

    @Field("interaction_weight")
    Double interactionWeight;

    @Field("created_at")
    LocalDateTime createdAt;
}