package com.hehe.thesocial.dto.response.metadata;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentActionResponse {
    boolean liked;
    boolean disliked;
    long likeCount;
    long dislikeCount;
}
