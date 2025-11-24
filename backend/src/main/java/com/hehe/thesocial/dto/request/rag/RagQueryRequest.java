package com.hehe.thesocial.dto.request.rag;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

/**
 * Request DTO for RAG query operations.
 * 
 * This request is used to query the vector store and generate AI responses
 * based on retrieved context.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RagQueryRequest {

    /**
     * The question or query to be answered using RAG.
     */
    @NotBlank(message = "Question is required")
    String question;

    /**
     * Number of top documents to retrieve from vector store.
     * Defaults to 5 if not specified.
     */
    Integer topK;

    /**
     * Optional custom system prompt for the AI model.
     * If not provided, a default prompt will be used.
     */
    String systemPrompt;
}

