import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

export interface PermissionResponse {
  id: string;
  name: string;
  permission?: string; // Some APIs use 'permission' instead of 'name'
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PermissionRequest {
  name?: string;
  permission?: string; // Some APIs use 'permission' instead of 'name'
  description: string;
}

class PermissionService {
  async getPermissions(
    page: number = 0,
    size: number = 12
  ): Promise<ApiResponse<PagedResponse<PermissionResponse>>> {
    const response = await apiClient.get(
      `/permissions?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getPermissionById(
    id: string
  ): Promise<ApiResponse<PermissionResponse>> {
    const response = await apiClient.get(`/permissions/${id}`);
    return response.data;
  }

  async createPermission(
    request: PermissionRequest
  ): Promise<ApiResponse<PermissionResponse>> {
    const response = await apiClient.post("/permissions", request);
    return response.data;
  }

  async updatePermission(
    id: string,
    request: PermissionRequest
  ): Promise<ApiResponse<PermissionResponse>> {
    const response = await apiClient.put(`/permissions/${id}`, request);
    return response.data;
  }

  async deletePermission(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/permissions/${id}`);
    return response.data;
  }
}

export const permissionService = new PermissionService();

