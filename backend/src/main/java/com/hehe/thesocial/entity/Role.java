package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.HashSet;
import java.util.Set;

@Document(collection = "roles")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Role extends BaseDocument{

    @MongoId
    @Field("_id")
    String id;

    @Field("role_name")
    String roleName;

    @Field("description")
    String description;

    @DocumentReference(lazy = true)
    @Field("permissions_ref")
    Set<Permission> permissions = new HashSet<>();
}
