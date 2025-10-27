package com.hehe.thesocial.dto.response.userDetail;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.hehe.thesocial.dto.response.user.UserResponse;
import com.hehe.thesocial.entity.FileDocument;
import com.hehe.thesocial.entity.UserDetail;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;

import java.util.Set;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
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
