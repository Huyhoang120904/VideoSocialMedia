package com.hehe.thesocial.dto.response.comment;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentCreateResponse {
    CommentResponse comment;
    long totalComments;
}
