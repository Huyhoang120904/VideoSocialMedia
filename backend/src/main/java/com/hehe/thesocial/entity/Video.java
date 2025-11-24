package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "videos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class Video extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @DBRef
    @Field("file_ref")
    FileDocument file;

    @Field("duration")
    double duration;

    @Field("thumbnail_url")
    String thumbnailUrl;
}
