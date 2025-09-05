package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document("videos")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Video {
    @MongoId
    String id;
    UserDetail uploader;

    FileDocument video;
    String thumbUrl;
    double duration;
}
