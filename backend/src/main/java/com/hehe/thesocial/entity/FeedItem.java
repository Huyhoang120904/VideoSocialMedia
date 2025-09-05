package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FeedItemType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document("user_details")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FeedItem extends BaseDocument {
    @MongoId
    String id;

    //content
    FeedItemType feedItemType;
    Video video;
    ImageSlide imageSlide;
    String caption;
    String description;
    Set<HashTag> hashTags;

    Set<Comment> comments;

    // Metric
    long likeCount;
    long commentCount;
    long shareCount;

    //author
    String avatar;


}
