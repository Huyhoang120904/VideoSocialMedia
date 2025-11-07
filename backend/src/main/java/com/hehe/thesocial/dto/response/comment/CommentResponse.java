package com.hehe.thesocial.dto.response.comment;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentResponse {
    String id;
    String content;
    long likeCount;
    long dislikeCount;
    int replyCount;
    String userDetailId;
    String username;
    String avatarUrl;
    Instant createdAt;
    Instant updatedAt;
    boolean isLikedByCurrentUser; // Check if current user liked this comment
}
