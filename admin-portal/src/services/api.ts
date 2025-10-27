import apiClient from "@/config/axios";
import {
  ApiResponse,
  PagedResponse,
  UserResponse,
  FileResponse,
  AuthenticateRequest,
  AuthenticateResponse,
  RefreshResponse,
  IntrospectRequest,
  IntrospectResponse,
  RegisterRequest,
  UserUpdateRequest,
  RoleResponse,
} from "@/types";

class AuthService {
  async authenticate(
    request: AuthenticateRequest
  ): Promise<ApiResponse<AuthenticateResponse>> {
    const response = await apiClient.post("/auth/token", request);
    return response.data;
  }

  async introspectToken(
    request: IntrospectRequest
  ): Promise<ApiResponse<IntrospectResponse>> {
    const response = await apiClient.post("/auth/introspect", request);
    return response.data;
  }

  async refreshToken(
    refreshToken: string
  ): Promise<ApiResponse<RefreshResponse>> {
    const response = await apiClient.post("/auth/refresh", { refreshToken });
    return response.data;
  }

  async logout(token: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post("/auth/logout", { token });
    return response.data;
  }
}

class UserService {
  async getUsers(
    page: number = 0,
    size: number = 12
  ): Promise<ApiResponse<PagedResponse<UserResponse>>> {
    const response = await apiClient.get(`/users?page=${page}&size=${size}`);
    return response.data;
  }

  async getUserById(userId: string): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.get(`/users/${userId}`);
    return response.data;
  }

  async updateUser(
    userId: string,
    userData: Partial<UserResponse>
  ): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.put(`/users/${userId}`, userData);
    return response.data;
  }

  async deleteUser(userId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/users/${userId}`);
    return response.data;
  }

  async registerUser(
    request: RegisterRequest
  ): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.post("/users", request);
    return response.data;
  }

  async updateUserById(
    userId: string,
    request: UserUpdateRequest
  ): Promise<ApiResponse<UserResponse>> {
    const response = await apiClient.put(`/users/${userId}`, request);
    return response.data;
  }
}

class VideoService {
  async getVideos(
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PagedResponse<FileResponse>>> {
    const response = await apiClient.get(`/videos?page=${page}&size=${size}`);
    return response.data;
  }

  async getVideosByUserId(
    userId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<PagedResponse<FileResponse>>> {
    const response = await apiClient.get(
      `/videos/user/${userId}?page=${page}&size=${size}`
    );
    return response.data;
  }

  async uploadVideo(
    file: File,
    title?: string,
    description?: string
  ): Promise<ApiResponse<FileResponse>> {
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);

    const response = await apiClient.post("/videos/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  async deleteVideo(videoId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/videos/${videoId}`);
    return response.data;
  }
}

export const authService = new AuthService();
export const userService = new UserService();
export const videoService = new VideoService();
