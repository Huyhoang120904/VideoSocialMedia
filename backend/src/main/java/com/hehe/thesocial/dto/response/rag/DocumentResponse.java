package com.hehe.thesocial.dto.response.rag;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Response DTO for document operations in RAG.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DocumentResponse {

    /**
     * Unique identifier for the document.
     */
    String documentId;

    /**
     * Document content.
     */
    String content;

    /**
     * Document metadata.
     */
    Map<String, Object> metadata;

    /**
     * Similarity score (for search results).
     * Higher values indicate better matches.
     */
    Double similarityScore;

    /**
     * Status message or description.
     */
    String message;
}

