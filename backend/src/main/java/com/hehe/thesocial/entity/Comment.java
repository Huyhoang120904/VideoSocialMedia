package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document("comments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Comment extends BaseDocument{
    @MongoId
    String id;

    String content;
    long likeCount;
    long dislikeCount;
    int replyCount;

    //Normalize user detail
    String userDetailId;
    String avatarUrl;

    Set<Comment> replies;
}
