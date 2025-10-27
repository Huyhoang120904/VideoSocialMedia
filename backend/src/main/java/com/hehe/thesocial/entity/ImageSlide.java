package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.util.List;
import java.util.Set;

@Document(collection = "image_slides")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class ImageSlide extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @DBRef
    @Field("uploader_ref")
    UserDetail uploader;

    @DBRef
    @Field("images_ref")
    List<FileDocument> images;

    @DBRef
    @Field("thumb_url")
    FileDocument thumbnail;

    @Field("caption")
    String captions;

    @DBRef
    @Field("hashtags_ref")
    List<HashTag> hashTags;

    @DBRef
    @Field("metadata_ref")
    MetaData metaData;
}
