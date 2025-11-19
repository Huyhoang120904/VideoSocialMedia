import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userService, videoService, feedItemService } from "@/services/api";
import { handleApiError } from "@/lib/error-handling";
import {
  ApiResponse,
  PagedResponse,
  UserResponse,
  FileResponse,
  CreateUserRequest,
  UpdateUserRequest,
  UploadVideoRequest,
  AnalyticsResponse,
  FeedItemUploadResponse,
  FeedItemListResponse,
  UploadFeedItemRequest,
  FeedItemType,
} from "@/types";

/**
 * Analytics-related React Query hooks
 */

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async (): Promise<ApiResponse<AnalyticsResponse>> => {
      try {
        const { analyticsService } = await import(
          "@/services/admin/analyticsService"
        );
        return analyticsService.getDashboardAnalytics();
      } catch (error) {
        handleApiError(error, {
          component: "useAnalytics",
          action: "fetchAnalytics",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useUsers(page: number = 0, size: number = 12) {
  return useQuery({
    queryKey: ["users", page, size],
    queryFn: async (): Promise<ApiResponse<PagedResponse<UserResponse>>> => {
      try {
        const response = await userService.getUsers(page, size);
        return response;
      } catch (error) {
        handleApiError(error, { component: "useUsers", action: "fetchUsers" });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry authentication errors
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: async (): Promise<ApiResponse<UserResponse>> => {
      try {
        const response = await userService.getUserById(userId);
        return response;
      } catch (error) {
        handleApiError(error, {
          component: "useUser",
          action: "fetchUser",
          userId,
        });
        throw error;
      }
    },
    enabled: !!userId,
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
      try {
        const response = await videoService.getVideos(page, size);
        return response;
      } catch (error) {
        handleApiError(error, {
          component: "useVideos",
          action: "fetchVideos",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) return false;
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
      try {
        const response = await videoService.getVideosByUserId(
          userId,
          page,
          size
        );
        return response;
      } catch (error) {
        handleApiError(error, {
          component: "useVideosByUser",
          action: "fetchUserVideos",
          userId,
        });
        throw error;
      }
    },
    enabled: !!userId,
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

/**
 * FeedItem-related React Query hooks with proper error handling
 */

export function useFeedItems(page: number = 0, size: number = 10) {
  return useQuery({
    queryKey: ["feedItems", page, size],
    queryFn: async (): Promise<ApiResponse<FeedItemListResponse>> => {
      try {
        const response = await feedItemService.getFeedItems(page, size);
        return response;
      } catch (error) {
        handleApiError(error, {
          component: "useFeedItems",
          action: "fetchFeedItems",
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error) => {
      const err = error as { response?: { status?: number } };
      if (err?.response?.status === 401) return false;
      return failureCount < 2;
    },
  });
}

export function useFeedItemsByUser(
  userId: string,
  page: number = 0,
  size: number = 10
) {
  return useQuery({
    queryKey: ["feedItems", "user", userId, page, size],
    queryFn: async (): Promise<ApiResponse<FeedItemListResponse>> => {
      try {
        const response = await feedItemService.getFeedItemsByUserId(
          userId,
          page,
          size
        );
        return response;
      } catch (error) {
        handleApiError(error, {
          component: "useFeedItemsByUser",
          action: "fetchUserFeedItems",
          userId,
        });
        throw error;
      }
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useFeedItemsByType(
  feedItemType: FeedItemType,
  page: number = 0,
  size: number = 10
) {
  return useQuery({
    queryKey: ["feedItems", "type", feedItemType, page, size],
    queryFn: async (): Promise<ApiResponse<FeedItemListResponse>> => {
      try {
        const response = await feedItemService.getFeedItemsByType(
          feedItemType,
          page,
          size
        );
        return response;
      } catch (error) {
        handleApiError(error, {
          component: "useFeedItemsByType",
          action: "fetchFeedItemsByType",
          feedItemType,
        });
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useUploadFeedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: UploadFeedItemRequest) => {
      const response = await feedItemService.uploadFeedItem(request);
      return response;
    },
    onSuccess: (data: ApiResponse<FeedItemUploadResponse>) => {
      if (data.code === 1000) {
        toast.success("Feed item uploaded successfully!");
        queryClient.invalidateQueries({ queryKey: ["feedItems"] });
      } else {
        toast.error(data.message || "Failed to upload feed item");
      }
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useUploadFeedItem",
        action: "uploadFeedItem",
      });
    },
  });
}

export function useDeleteFeedItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (feedItemId: string) => {
      const response = await feedItemService.deleteFeedItem(feedItemId);
      return response;
    },
    onSuccess: (data: ApiResponse<void>, feedItemId: string) => {
      if (data.code === 1000) {
        toast.success("Feed item deleted successfully!");
        queryClient.invalidateQueries({ queryKey: ["feedItems"] });
        queryClient.removeQueries({ queryKey: ["feedItem", feedItemId] });
      } else {
        toast.error(data.message || "Failed to delete feed item");
      }
    },
    onError: (error: unknown) => {
      handleApiError(error, {
        component: "useDeleteFeedItem",
        action: "deleteFeedItem",
      });
    },
  });
}
