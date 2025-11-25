package com.hehe.thesocial.dto.request.comment;

import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CommentCreateRequest {
    @NotBlank(message = "Content cannot be blank")
    String content;
    
    // Optional: ID of parent comment if this is a reply
    String parentCommentId;
    
    // Set by backend from JWT token, not sent from frontend
    String userDetailId;
}
