package com.hehe.thesocial.dto.response.rag;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.util.List;

/**
 * Response DTO for RAG query operations.
 * 
 * Contains the AI-generated answer along with the retrieved context
 * that was used to generate the response.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RagQueryResponse {

    /**
     * The original question that was asked.
     */
    String question;

    /**
     * The AI-generated answer based on retrieved context.
     */
    String answer;

    /**
     * List of documents retrieved from the vector store.
     */
    List<DocumentResponse> retrievedDocuments;

    /**
     * The formatted context that was used to generate the answer.
     */
    String contextUsed;

    /**
     * Status message or description.
     */
    String message;
}

