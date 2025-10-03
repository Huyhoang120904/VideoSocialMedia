package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "hashtags")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class HashTag extends BaseDocument {
    @MongoId
    @Field("_id")
    String id;

    @Field("name")
    String name;

    @Field("view_count")
    int viewCount;

    @Field("video_count")
    int videoCount;
}
