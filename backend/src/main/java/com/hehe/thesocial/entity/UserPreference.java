package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Document(collection = "user_preference")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class UserPreference {
    @MongoId
    @Field("_id")
    String id;

    @Indexed(unique = true)
    @Field("user_id")
    String userId;

    @Field("hashtag_scores")
    @Builder.Default
    Map<String, Double> hashtagScores = new HashMap<>();

    @Field("creator_scores")
    @Builder.Default
    Map<String, Double> creatorScores = new HashMap<>();

    @Field("preferred_video_duration")
    Double preferredVideoDuration;

    @Field("last_seen_feed_items")
    Set<String> lastSeenFeedItems;

    @Field("updated_at")
    LocalDateTime updatedAt;
}
