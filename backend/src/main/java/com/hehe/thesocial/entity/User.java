package com.hehe.thesocial.entity;

import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends BaseDocument {
    @MongoId
    @Field("_id")
    String id;

    @Field("password")
    String password;

    @Email
    @Indexed(unique = true, sparse = true)
    @Field("mail")
    String mail;

    @Indexed(unique = true)
    @Field("username")
    String username;

    @Field("enable")
    @Builder.Default
    Boolean enable = false;

    @DocumentReference(lazy = true)
    @Field("roles_ref")
    @Builder.Default
    Set<Role> roles = new HashSet<>();
}
