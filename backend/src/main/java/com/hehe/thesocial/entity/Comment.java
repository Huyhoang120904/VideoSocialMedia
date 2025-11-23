package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.*;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "comments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Comment extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("content")
    String content;

    @Builder.Default
    @Field("like_count")
    long loveCount = 0L;

    @Builder.Default
    @Field("dislike_count")
    long dislikeCount = 0L;

    @Builder.Default
    @Field("reply_count")
    int replyCount = 0;

    @Builder.Default
    @Field("love_by")
    Set<String> lovedBy = new HashSet<>();

    @Builder.Default
    @Field("disliked_by")
    Set<String> dislikedBy = new HashSet<>();

    @Field("user_detail_id")
    String userDetailId;

    @Field("feed_item_id")
    String feedItemId;

    @Field("avatar_url")
    String avatarUrl;
}
