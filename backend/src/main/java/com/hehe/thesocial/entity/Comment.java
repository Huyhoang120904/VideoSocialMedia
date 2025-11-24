package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.*;

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

    @Field("like_count")
    long loveCount;

    @Field("dislike_count")
    long dislikeCount;

    @Field("reply_count")
    int replyCount;

    @Field("love_by")
    Set<String> lovedBy;

    @Field("disliked_by")
    Set<String> dislikedBy;

    @Field("user_detail_id")
    String userDetailId;

    @Field("avatar_url")
    String avatarUrl;

    @Field("feed_item_id")
    String feedItemId;

    @Field("parent_comment_id")
    String parentCommentId; // null for top-level comments

    @Field("reply_ids")
    Set<String> replyIds; // IDs of direct reply comments

}
