package com.hehe.thesocial.dto.response.file;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FileMetricsResponse {
    long totalFiles;
    long totalVideos;
    long totalImages;
    long totalOtherFiles;
    long flaggedFiles;
    long deletedFiles;
    long totalStorageBytes;
    String formattedStorageUsed;
}

