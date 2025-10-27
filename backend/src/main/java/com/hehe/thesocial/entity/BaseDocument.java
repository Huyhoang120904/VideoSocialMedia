package com.hehe.thesocial.entity;


import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.Instant;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BaseDocument {
    @CreatedDate
    @Field("created_at")
    Instant createdAt;

    @CreatedBy
    @Field("created_by")
    String createdBy;

    @LastModifiedDate
    @Field("updated_at")
    Instant updatedAt;

    @LastModifiedBy
    @Field("updated_by")
    String updatedBy;
}
