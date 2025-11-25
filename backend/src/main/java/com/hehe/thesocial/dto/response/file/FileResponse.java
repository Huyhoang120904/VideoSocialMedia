package com.hehe.thesocial.dto.response.file;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.dto.response.userDetail.UserDetailResponse;
import com.hehe.thesocial.entity.enums.FileStatus;
import com.hehe.thesocial.entity.enums.FileType;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileResponse {
    String id;
    String fileName;
    String originalFileName;
    FileType fileType;
    Long size;
    String url;
    String secureUrl;
    String format;
    int width;
    int height;
    String etag;
    String title;
    String description;
    String thumbnailUrl;
    FileStatus status;
    String flagReason;
    String deleteReason;
    LocalDateTime flaggedAt;
    LocalDateTime deletedAt;
    LocalDateTime createdAt;
    LocalDateTime updatedAt;
    UserDetailResponse uploader;
    UserDetailResponse flaggedBy;
    UserDetailResponse deletedBy;
}
