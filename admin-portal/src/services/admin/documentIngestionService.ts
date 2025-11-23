import apiClient from "@/config/axios";
import {
  ApiResponse,
  DocumentIngestionResponse,
  BatchIngestionResponse,
} from "@/types";

class DocumentIngestionService {
  /**
   * Ingest a single document into the vector store
   * @param file Document file to ingest
   * @param metadata Optional metadata as JSON string
   */
  async ingestDocument(
    file: File,
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<DocumentIngestionResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await apiClient.post(
      "/document-ingestion/ingest",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Ingest multiple documents into the vector store
   * @param files Array of document files to ingest
   * @param metadata Optional metadata as JSON string
   */
  async ingestBatchDocuments(
    files: File[],
    metadata?: Record<string, unknown>
  ): Promise<ApiResponse<BatchIngestionResponse>> {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    if (metadata) {
      formData.append("metadata", JSON.stringify(metadata));
    }

    const response = await apiClient.post(
      "/document-ingestion/ingest-batch",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Get supported document formats
   */
  async getSupportedFormats(): Promise<ApiResponse<Map<string, unknown>>> {
    const response = await apiClient.get(
      "/document-ingestion/supported-formats"
    );
    return response.data;
  }
}

export const documentIngestionService = new DocumentIngestionService();
