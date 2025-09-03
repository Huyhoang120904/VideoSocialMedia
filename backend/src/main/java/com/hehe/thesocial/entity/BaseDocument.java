package com.hehe.thesocial.entity;


import lombok.AccessLevel;
import lombok.Data;
import lombok.experimental.FieldDefaults;
import org.springframework.data.annotation.CreatedBy;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedBy;
import org.springframework.data.annotation.LastModifiedDate;

import java.time.Instant;

@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BaseDocument {
    @CreatedDate
    Instant createdAt;

    @CreatedBy
    String createdBy;

    @LastModifiedDate
    Instant updatedAt;

    @LastModifiedBy
    String updatedBy;
}
