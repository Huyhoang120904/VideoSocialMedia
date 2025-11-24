package com.hehe.thesocial.dto.request.file;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hehe.thesocial.entity.enums.FileStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileSearchRequest {

    @Schema(description = "Keyword to search across file name, original name, and description")
    String keyword;

    @Schema(description = "File type filter (video, image, other)")
    String fileType;

    @Schema(description = "File status filter (ACTIVE, FLAGGED, DELETED)")
    FileStatus status;

    @Schema(description = "Uploader user detail id")
    String uploaderId;

    @Schema(description = "Uploader username")
    String uploaderUsername;

    @Schema(description = "Minimum file size in bytes")
    Long minSize;

    @Schema(description = "Maximum file size in bytes")
    Long maxSize;

    @Schema(description = "From created date (inclusive)")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime createdFrom;

    @Schema(description = "To created date (inclusive)")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME)
    LocalDateTime createdTo;

    @Schema(description = "Page number (0-indexed)")
    @Builder.Default
    Integer page = 0;

    @Schema(description = "Page size")
    @Builder.Default
    Integer size = 20;

    @Schema(description = "Sort by field (createdAt, size, fileName)")
    @Builder.Default
    String sortBy = "createdAt";

    @Schema(description = "Sort direction")
    @Builder.Default
    Sort.Direction sortDirection = Sort.Direction.DESC;
}

