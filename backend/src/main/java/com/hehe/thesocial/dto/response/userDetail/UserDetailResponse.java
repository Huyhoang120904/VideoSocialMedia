package com.hehe.thesocial.dto.response.userDetail;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.user.UserResponse;
import com.hehe.thesocial.entity.FileDocument;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDetailResponse {
    String id;
    UserResponse user;
    FileDocument avatar;
    String displayName;
    String bio;

    String shownName;
    int followingCount;
    int followerCount;
}
