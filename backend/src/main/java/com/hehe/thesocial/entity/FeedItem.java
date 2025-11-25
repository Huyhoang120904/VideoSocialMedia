package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Document(collection = "feed_items")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
@ToString
public class FeedItem extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("feed_item_type")
    FeedItemType feedItemType;

    @DBRef
    @Field("video_ref")
    Video video;

    @DBRef
    @Field("image_slide_ref")
    ImageSlide imageSlide;

    @DBRef
    @Field("thumbnail_ref")
    FileDocument thumbnail;

    @Field("title")
    String title;

    @Field("description")
    String description;

    @DBRef
    @Field("hashtags_ref")
    Set<HashTag> hashTags;

    @DBRef
    @Field("comments_ref")
    Set<Comment> comments;

    @DBRef
    @Field("metadata_ref")
    MetaData metaData;

    // UserDetail Id
    @Field("loved_by")
    Set<String> lovedBy;

    //UserDetailId
    @DBRef
    @Field("uploader_ref")
    UserDetail uploader;

    @Field("report_count")
    @Builder.Default
    int reportCount = 0;

    @Field("status")
    @Builder.Default
    boolean violated = false;

    @Field("active")
    @Builder.Default
    boolean active = true;

    @DBRef
    @Field("disabled_by_ref")
    UserDetail disabledBy;

    @Field("disabled_at")
    LocalDateTime disabledAt;
}
