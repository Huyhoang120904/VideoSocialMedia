package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document(collection = "feed_items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedItem extends BaseDocument {
    @MongoId
    @Field("_id")
    String id;

    //content
    @Field("feed_item_type")
    FeedItemType feedItemType;

    @DocumentReference(lazy = true)
    @Field("video_ref")
    Video video;

    @DocumentReference(lazy = true)
    @Field("image_slide_ref")
    ImageSlide imageSlide;

    @Field("caption")
    String caption;

    @Field("description")
    String description;

    @DocumentReference(lazy = true)
    @Field("hashtags_ref")
    Set<HashTag> hashTags;

    @DocumentReference(lazy = true)
    @Field("comments_ref")
    Set<Comment> comments;

    // Metric
    @Field("like_count")
    long likeCount;

    @Field("comment_count")
    long commentCount;

    @Field("share_count")
    long shareCount;

    //author
    @Field("avatar")
    String avatar;
}
