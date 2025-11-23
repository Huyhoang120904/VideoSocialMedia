package com.hehe.thesocial.dto.request.rag;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.Map;

/**
 * Request DTO for adding a document to the RAG vector store.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AddDocumentRequest {

    /**
     * Document content to be embedded and stored.
     * This is the main text content that will be vectorized.
     */
    @NotBlank(message = "Document content is required")
    String content;

    /**
     * Optional document ID. If not provided, a UUID will be generated.
     */
    String documentId;

    /**
     * Optional metadata to associate with the document.
     * Useful for filtering, categorization, or additional context.
     */
    Map<String, Object> metadata;
}

