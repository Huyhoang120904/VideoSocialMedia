package com.hehe.thesocial.entity;

import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
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
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class User extends BaseDocument {
    @EqualsAndHashCode.Include
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

    @DBRef(lazy = false)
    @Field("roles_ref")
    @Builder.Default
    Set<Role> roles = new HashSet<>();
}
