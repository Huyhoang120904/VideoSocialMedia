package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document("user_details")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserDetail extends BaseDocument{
    @MongoId
    String id;
    String userId;
    FileDocument avatar;
    String displayName;
    String bio;

    @Indexed(unique = true)
    String shownName;

    Set<UserDetail> following;
    int followingCount;

    Set<UserDetail> follower;
    int followerCount;


}