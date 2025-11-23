package com.hehe.thesocial.dto.response.documentingestion;

import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class BatchIngestionResponse {
    String message;
    Integer totalFiles;
    Integer successCount;
    Integer failureCount;
    Integer totalChunksCreated;
    Map<String, String> failures;
}