package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FileStatus;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.MongoId;

import java.time.LocalDateTime;

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

    @Field("original_file_name")
    String originalFileName;

    @Field("size")
    Long size;

    @Field("public_id")
    String publicId;

    @Field("url")
    String url;

    @Field("resource_type")
    String resourceType;

    @Field("width")
    int width;

    @Field("height")
    int height;

    @Field("etag")
    String etag;

    @Field("description")
    String description;

    @Field("thumbnail_url")
    String thumbnailUrl;

    @DBRef
    @Field("uploader_ref")
    UserDetail uploader;

    @Field("status")
    @Builder.Default
    FileStatus status = FileStatus.ACTIVE;

    @Field("flag_reason")
    String flagReason;

    @DBRef
    @Field("flagged_by_ref")
    UserDetail flaggedBy;

    @Field("flagged_at")
    LocalDateTime flaggedAt;

    @Field("deleted_at")
    LocalDateTime deletedAt;

    @DBRef
    @Field("deleted_by_ref")
    UserDetail deletedBy;

    @Field("delete_reason")
    String deleteReason;
}
