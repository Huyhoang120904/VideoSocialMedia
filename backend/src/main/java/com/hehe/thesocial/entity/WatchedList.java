package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document(collection = "videos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class WatchedList {

    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("user_detail_id")
    String userDetailId;

    @Field("watched_feed_items")
    Set<String> watchFeedItemIds;
}
