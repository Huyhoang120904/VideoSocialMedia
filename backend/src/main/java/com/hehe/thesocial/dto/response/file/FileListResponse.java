package com.hehe.thesocial.dto.response.file;

import com.fasterxml.jackson.annotation.JsonInclude;
import org.springframework.data.domain.Page;
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
public class FileListResponse {
    Page<FileResponse> files;
    String message;
    long totalElements;
    int totalPages;
    int currentPage;
    int pageSize;
}

