package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.InteractionType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;

@Document(collection = "user_interaction")
@CompoundIndex(name = "user_feed_interaction_idx", def = "{'user_detail_id': 1, 'feed_item_id': 1, 'interaction_type': 1}")
@CompoundIndex(name = "user_created_idx", def = "{'user_detail_id': 1, 'created_at': -1}")
@CompoundIndex(name = "feed_interaction_idx", def = "{'feed_item_id': 1, 'interaction_type': 1}")
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

    @Field("user_detail_id")
    String userDetailId;

    @Field("creator_id")
    String creatorId;

    @Field("feed_item_id")
    String feedItemId;

    @Field("interaction_type")
    InteractionType interactionType;

    @Field("watch_duration")
    Double watchDuration; // in seconds

    @Field("watch_percentage")
    Double watchPercentage;

    @Field("created_at")
    LocalDateTime createdAt;
}