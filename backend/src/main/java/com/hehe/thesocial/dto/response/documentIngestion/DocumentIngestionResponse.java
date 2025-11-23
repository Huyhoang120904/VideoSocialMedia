package com.hehe.thesocial.dto.response.documentingestion;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Response DTO for document ingestion operations.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentIngestionResponse {

    /**
     * Success message.
     */
    String message;

    /**
     * Original filename of the ingested document.
     */
    String filename;

    /**
     * Number of chunks created from the document.
     */
    Integer chunksCreated;

    /**
     * File size in bytes.
     */
    Long fileSize;

    /**
     * Content type of the document.
     */
    String contentType;
}

