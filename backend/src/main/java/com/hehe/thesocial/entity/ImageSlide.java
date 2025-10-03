package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DocumentReference;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;


import java.util.Set;

@Document(collection = "image_slides")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ImageSlide extends BaseDocument {

    @MongoId
    @Field("_id")
    String id;

    @DocumentReference(lazy = true)
    @Field("images_ref")
    Set<FileDocument> images;

    @Field("thumb_url")
    String thumbUrl;
}
