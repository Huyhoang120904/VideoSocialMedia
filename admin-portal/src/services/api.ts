import apiClient from "@/config/axios";

export interface ApiResponse<T> {
  code: number;
  message: string;
  timeStamp: string;
  result: T;
}

export interface AuthenticateRequest {
  username: string;
  password: string;
}

export interface AuthenticateResponse {
  token: string;
  expireAt: string;
}

export interface RefreshResponse {
  token: string;
  expireAt: string;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  isValid: boolean;
  userId: string;
}

export interface UserResponse {
  id: string;
  username: string;
  mail: string;
  phoneNumber: string;
  enable?: boolean;
  roles: RoleResponse[];
}

export interface RegisterRequest {
  username: string;
  mail: string;
  phoneNumber: string;
  password: string;
}

export interface UserUpdateRequest {
  username: string;
  password?: string;
  mail: string;
  phoneNumber: string;
  enable?: boolean;
}

export interface RoleResponse {
  id: string;
  name: string;
  description: string;
}

export interface FileResponse {
  id: string;
  fileName: string;
  fileType: string;
  size: number;
  url: string;
  secureUrl: string;
  format: string;
  width: number;
  height: number;
  etag: string;
}

export interface PagedResponse<T> {
  content: T[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    offset: number;
    paged: boolean;
    unpaged: boolean;
  };
  last: boolean;
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  first: boolean;
  numberOfElements: number;
  empty: boolean;
}

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
