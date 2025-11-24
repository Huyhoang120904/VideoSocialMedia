import apiClient from "@/config/axios";
import {
  ApiResponse,
  FileActionRequest,
  FileListResponse,
  FileMetricsResponse,
  FileResponse,
  FileSearchRequest,
} from "@/types";

class FileManagementService {
  async searchFiles(
    request: FileSearchRequest
  ): Promise<ApiResponse<FileListResponse>> {
    const response = await apiClient.post("/files/search", request ?? {});
    return response.data;
  }

  async getFileMetrics(): Promise<ApiResponse<FileMetricsResponse>> {
    const response = await apiClient.get("/files/metrics");
    return response.data;
  }

  async deleteFile(
    fileId: string,
    payload: FileActionRequest
  ): Promise<ApiResponse<FileResponse>> {
    const response = await apiClient.delete(`/files/${fileId}`, {
      data: payload,
    });
    return response.data;
  }

  async restoreFile(
    fileId: string,
    payload?: FileActionRequest
  ): Promise<ApiResponse<FileResponse>> {
    const response = await apiClient.put(
      `/files/${fileId}/restore`,
      payload ?? {}
    );
    return response.data;
  }

  async flagFile(
    fileId: string,
    payload: FileActionRequest
  ): Promise<ApiResponse<FileResponse>> {
    const response = await apiClient.put(`/files/${fileId}/flag`, payload);
    return response.data;
  }

  async unflagFile(
    fileId: string,
    payload?: FileActionRequest
  ): Promise<ApiResponse<FileResponse>> {
    const response = await apiClient.put(
      `/files/${fileId}/unflag`,
      payload ?? {}
    );
    return response.data;
  }
}

export const fileManagementService = new FileManagementService();


