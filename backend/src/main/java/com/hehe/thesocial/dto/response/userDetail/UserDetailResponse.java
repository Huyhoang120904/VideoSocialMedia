package com.hehe.thesocial.dto.response.userDetail;

import com.fasterxml.jackson.annotation.JsonIgnore;
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
    String userId;
    FileDocument avatar;
    String displayName;
    String bio;

    String shownName;

    Set<UserDetail> following;
    int followingCount;

    Set<UserDetail> follower;
    int followerCount;
}
