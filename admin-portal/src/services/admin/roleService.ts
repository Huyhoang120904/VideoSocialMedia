import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "../api";

export interface RoleResponse {
  id: string;
  roleName: string;
  description: string;
  permissions: PermissionResponse[];
}

export interface PermissionResponse {
  id: string;
  permission: string;
  description: string;
}

export interface RoleRequest {
  roleName: string;
  description: string;
}

export interface PermissionRequest {
  permission: string;
  description: string;
}

class RoleService {
  async getRoles(
    page: number = 0,
    size: number = 12
  ): Promise<ApiResponse<PagedResponse<RoleResponse>>> {
    const response = await apiClient.get(`/roles?page=${page}&size=${size}`);
    return response.data;
  }

  async getRoleById(roleId: string): Promise<ApiResponse<RoleResponse>> {
    const response = await apiClient.get(`/roles/${roleId}`);
    return response.data;
  }

  async createRole(request: RoleRequest): Promise<ApiResponse<RoleResponse>> {
    const response = await apiClient.post("/roles", request);
    return response.data;
  }

  async updateRole(
    roleId: string,
    request: RoleRequest
  ): Promise<ApiResponse<RoleResponse>> {
    const response = await apiClient.put(`/roles/${roleId}`, request);
    return response.data;
  }

  async deleteRole(roleId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/roles/${roleId}`);
    return response.data;
  }

  async addPermissionToRole(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<RoleResponse>> {
    const response = await apiClient.post(
      `/roles/${roleId}/permissions/${permissionId}`
    );
    return response.data;
  }

  async removePermissionFromRole(
    roleId: string,
    permissionId: string
  ): Promise<ApiResponse<RoleResponse>> {
    const response = await apiClient.delete(
      `/roles/${roleId}/permissions/${permissionId}`
    );
    return response.data;
  }
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
    permissionId: string
  ): Promise<ApiResponse<PermissionResponse>> {
    const response = await apiClient.get(`/permissions/${permissionId}`);
    return response.data;
  }

  async createPermission(
    request: PermissionRequest
  ): Promise<ApiResponse<PermissionResponse>> {
    const response = await apiClient.post("/permissions", request);
    return response.data;
  }

  async updatePermission(
    permissionId: string,
    request: PermissionRequest
  ): Promise<ApiResponse<PermissionResponse>> {
    const response = await apiClient.put(
      `/permissions/${permissionId}`,
      request
    );
    return response.data;
  }

  async deletePermission(permissionId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/permissions/${permissionId}`);
    return response.data;
  }
}

export const roleService = new RoleService();
export const permissionService = new PermissionService();

