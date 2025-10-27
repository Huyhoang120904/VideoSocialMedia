import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService, videoService } from "@/services/api";
import { handleApiError, ErrorContext } from "@/lib/error-handling";
import {
  ApiResponse,
  PagedResponse,
  UserResponse,
  FileResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UploadVideoRequest,
  AnalyticsResponse,
} from "@/types";

/**
 * Analytics-related React Query hooks
 */

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async (): Promise<ApiResponse<AnalyticsResponse>> => {
      // Mock analytics data for now - replace with actual service call
      const mockAnalytics: ApiResponse<AnalyticsResponse> = {
        code: 1000,
        message: "Success",
        timeStamp: new Date().toISOString(),
        result: {
          totalUsers: 1250,
          activeUsersToday: 89,
          totalVideos: 5670,
          videosUploadedToday: 23,
          totalStorageUsed: 1024 * 1024 * 1024 * 2.5, // 2.5 GB
          usersByRole: [
            { role: "ADMIN", count: 5 },
            { role: "MODERATOR", count: 12 },
            { role: "USER", count: 1233 },
          ],
          videosByType: [
            { type: "MP4", count: 4500 },
            { type: "MOV", count: 800 },
            { type: "AVI", count: 370 },
          ],
        },
      };
      return mockAnalytics;
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useAnalytics",
        action: "fetchAnalytics",
      });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useUsers(page: number = 0, size: number = 12) {
  return useQuery({
    queryKey: ["users", page, size],
    queryFn: async (): Promise<ApiResponse<PagedResponse<UserResponse>>> => {
      const response = await userService.getUsers(page, size);
      return response;
    },
    onError: (error: unknown) => {
      handleApiError(error, { component: "useUsers", action: "fetchUsers" });
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: unknown) => {
      // Don't retry authentication errors
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<ApiResponse<UserResponse>> => {
      const response = await userService.getUserById(userId);
      return response;
    },
    enabled: !!userId,
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useUser",
        action: "fetchUser",
        userId,
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: CreateUserRequest) => {
      const response = await userService.registerUser(userData);
      return response;
    },
    onSuccess: (data: ApiResponse<UserResponse>) => {
      if (data.code === 1000) {
        toast.success("User created successfully!");
        queryClient.invalidateQueries({ queryKey: ["users"] });
      } else {
        toast.error(data.message || "Failed to create user");
      }
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useCreateUser",
        action: "createUser",
      });
    },
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      userData,
    }: {
      userId: string;
      userData: UpdateUserRequest;
    }) => {
      const response = await userService.updateUser(userId, userData);
      return response;
    },
    onSuccess: (data: ApiResponse<UserResponse>, variables) => {
      if (data.code === 1000) {
        toast.success("User updated successfully!");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.invalidateQueries({ queryKey: ["user", variables.userId] });
      } else {
        toast.error(data.message || "Failed to update user");
      }
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useUpdateUser",
        action: "updateUser",
      });
    },
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await userService.deleteUser(userId);
      return response;
    },
    onSuccess: (data: ApiResponse<void>, userId: string) => {
      if (data.code === 1000) {
        toast.success("User deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["users"] });
        queryClient.removeQueries({ queryKey: ["user", userId] });
      } else {
        toast.error(data.message || "Failed to delete user");
      }
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useDeleteUser",
        action: "deleteUser",
      });
    },
  });
}

/**
 * Video-related React Query hooks with proper error handling
 */

export function useVideos(page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ["videos", page, size],
    queryFn: async (): Promise<ApiResponse<PagedResponse<FileResponse>>> => {
      const response = await videoService.getVideos(page, size);
      return response;
    },
    onError: (error: unknown) => {
      handleApiError(error, { component: "useVideos", action: "fetchVideos" });
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: unknown) => {
      if ((error as any)?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useVideosByUser(
  userId: string,
  page: number = 0,
  size: number = 10
) {
  return useQuery({
    queryKey: ["videos", "user", userId, page, size],
    queryFn: async (): Promise<ApiResponse<PagedResponse<FileResponse>>> => {
      const response = await videoService.getVideosByUserId(userId, page, size);
      return response;
    },
    enabled: !!userId,
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useVideosByUser",
        action: "fetchUserVideos",
        userId,
      });
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUploadVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ file, title, description }: UploadVideoRequest) => {
      const response = await videoService.uploadVideo(file, title, description);
      return response;
    },
    onSuccess: (data: ApiResponse<FileResponse>) => {
      if (data.code === 1000) {
        toast.success("Video uploaded successfully!");
        queryClient.invalidateQueries({ queryKey: ["videos"] });
      } else {
        toast.error(data.message || "Failed to upload video");
      }
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useUploadVideo",
        action: "uploadVideo",
      });
    },
  });
}

export function useDeleteVideo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (videoId: string) => {
      const response = await videoService.deleteVideo(videoId);
      return response;
    },
    onSuccess: (data: ApiResponse<void>, videoId: string) => {
      if (data.code === 1000) {
        toast.success("Video deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["videos"] });
        queryClient.removeQueries({ queryKey: ["video", videoId] });
      } else {
        toast.error(data.message || "Failed to delete video");
      }
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useDeleteVideo",
        action: "deleteVideo",
      });
    },
  });
}
