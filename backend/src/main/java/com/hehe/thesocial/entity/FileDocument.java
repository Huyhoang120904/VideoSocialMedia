package com.hehe.thesocial.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document(collection = "files")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@EqualsAndHashCode(onlyExplicitlyIncluded = true, callSuper = false)
public class FileDocument extends BaseDocument {
    @EqualsAndHashCode.Include
    @MongoId
    @Field("_id")
    String id;

    @Field("file_name")
    String fileName;

    @Field("size")
    Long size;

    @Field("public_id")
    String publicId;

    @Field("url")
    String url;

    @Field("secure_url")
    String secureUrl;

    @Field("format")
    String format;

    @Field("resource_type")
    String resourceType;

    @Field("width")
    int width;

    @Field("height")
    int height;

    @Field("etag")
    String etag;
}
