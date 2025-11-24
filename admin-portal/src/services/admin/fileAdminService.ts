import apiClient from "@/config/axios";
import { ApiResponse } from "@/types";

export interface FileAdminResponse {
  totalFiles: number;
  totalSize: number;
  filesByType: Record<string, number>;
  recentFiles: FileInfo[];
}

export interface FileInfo {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  url: string;
  uploaderId?: string;
  createdAt: string;
}

class FileAdminService {
  async getFileStats(): Promise<ApiResponse<FileAdminResponse>> {
    const response = await apiClient.get("/admin/files");
    return response.data;
  }
}

export const fileAdminService = new FileAdminService();

