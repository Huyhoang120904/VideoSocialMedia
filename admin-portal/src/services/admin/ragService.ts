import apiClient from "@/config/axios";
import {
  ApiResponse,
  AddDocumentRequest,
  DocumentResponse,
  RagQueryRequest,
  RagQueryResponse,
} from "@/types";

/**
 * Get the access token from the API route
 */
async function getAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/token", {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const data = await response.json();
      return data.token || null;
    }
    return null;
  } catch (error) {
    console.error("Failed to get access token:", error);
    return null;
  }
}

class RagService {
  /**
   * Add a document to the vector store
   * @param request Document content and metadata
   */
  async addDocument(
    request: AddDocumentRequest
  ): Promise<ApiResponse<DocumentResponse>> {
    const response = await apiClient.post("/rag/documents", request);
    return response.data;
  }

  /**
   * Add multiple documents to the vector store
   * @param requests List of document requests
   */
  async addDocuments(
    requests: AddDocumentRequest[]
  ): Promise<ApiResponse<DocumentResponse[]>> {
    const response = await apiClient.post("/rag/documents/batch", requests);
    return response.data;
  }

  /**
   * Search for similar documents in the vector store
   * @param query Search query text
   * @param topK Number of top results to return (default: 5)
   */
  async searchDocuments(
    query: string,
    topK: number = 5
  ): Promise<ApiResponse<DocumentResponse[]>> {
    const response = await apiClient.get("/rag/documents/search", {
      params: { query, topK },
    });
    return response.data;
  }

  /**
   * Delete a document from the vector store
   * @param documentId Document ID to delete
   */
  async deleteDocument(documentId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/rag/documents/${documentId}`);
    return response.data;
  }

  /**
   * Delete multiple documents from the vector store
   * @param documentIds List of document IDs to delete
   */
  async deleteDocuments(
    documentIds: string[]
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.delete("/rag/documents/batch", {
      data: documentIds,
    });
    return response.data;
  }

  /**
   * Query with RAG: retrieve relevant context and generate AI response
   * @param request RAG query request with question and parameters
   */
  async queryWithRag(
    request: RagQueryRequest
  ): Promise<ApiResponse<RagQueryResponse>> {
    // Explicitly get and include access token for RAG queries
    const token = await getAccessToken();
    
    const response = await apiClient.post("/rag/query", request, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    return response.data;
  }
}

export const ragService = new RagService();

