package com.hehe.thesocial.entity;

import com.hehe.thesocial.entity.enums.FileType;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

@Document("files")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class FileDocument extends BaseDocument {
    @MongoId
    String id;

    String fileName;
    String uploadedBy;
    FileType fileType;
    Long size;

    // Cloudinary-specific fields
    String publicId;
    String url;
    String secureUrl;
    String format;
    String resourceType;

    // Optional additional Cloudinary metadata
    int width;
    int height;
    String etag;
}
