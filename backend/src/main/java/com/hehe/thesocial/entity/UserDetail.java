package com.hehe.thesocial.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
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
public class UserDetail extends BaseDocument {
    @MongoId
    String id;

    @DBRef
    User user;

    FileDocument avatar;
    String displayName;
    String bio;


    String shownName;

    @JsonIgnore
    @DBRef
    Set<UserDetail> following;
    int followingCount;

    @JsonIgnore
    @DBRef
    Set<UserDetail> follower;
    int followerCount;
}