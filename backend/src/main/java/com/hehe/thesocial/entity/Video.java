package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "videos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Video extends BaseDocument {
    @MongoId
    @Field("_id")
    String id;

    @DocumentReference(lazy = true)
    @Field("uploader_ref")
    UserDetail uploader;

    @DocumentReference(lazy = true)
    @Field("video_ref")
    FileDocument video;

    @Field("thumb_url")
    String thumbUrl;

    @Field("duration")
    double duration;
}
