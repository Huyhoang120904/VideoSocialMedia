package com.hehe.thesocial.entity;

import jakarta.validation.constraints.Email;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.HashSet;
import java.util.Set;

@Document("users")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class User extends BaseDocument {
    @MongoId
    String id;

    String password;

    @Email
    @Indexed(unique = true)
    String mail;

    @Indexed(unique = true)
    String username;

    boolean enable;

    @DBRef
    Set<Role> roles = new HashSet<>();


}
