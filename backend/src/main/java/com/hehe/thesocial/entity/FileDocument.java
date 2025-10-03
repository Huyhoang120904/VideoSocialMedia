package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FileType;
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
public class FileDocument extends BaseDocument {
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
}
