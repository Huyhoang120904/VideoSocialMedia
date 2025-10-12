package com.hehe.thesocial.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.Set;

@Document("user_details")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class UserDetail extends BaseDocument {

    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @DBRef
    @Field("user_ref")
    User user;

    @DBRef
    @Field("avatar_ref")
    FileDocument avatar;

    @Field("display_name")
    String displayName;

    @Field("bio")
    String bio;

    @Field("shown_name")
    String shownName;

    @JsonIgnore
    @DBRef
    @Field("following_ref")
    Set<UserDetail> following;

    @Field("following_count")
    int followingCount;

    @JsonIgnore
    @DBRef
    @Field("follower_ref")
    Set<UserDetail> follower;

    @Field("follower_count")
    int followerCount;
}