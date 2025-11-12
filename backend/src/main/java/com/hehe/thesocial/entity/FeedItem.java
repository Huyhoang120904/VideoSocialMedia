package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

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
}
