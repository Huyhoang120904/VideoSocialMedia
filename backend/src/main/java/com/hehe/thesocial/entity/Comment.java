package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document(collection = "comments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Comment extends BaseDocument{
    @MongoId
    @Field("_id")
    String id;

    @Field("content")
    String content;

    @Field("like_count")
    long likeCount;

    @Field("dislike_count")
    long dislikeCount;

    @Field("reply_count")
    int replyCount;

    //Normalize user detail
    @Field("user_detail_id")
    String userDetailId;

    @Field("avatar_url")
    String avatarUrl;

    @DocumentReference(lazy = true)
    @Field("replies_ref")
    Set<Comment> replies;
}
