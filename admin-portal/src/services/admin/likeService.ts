import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

export interface LikeResponse {
  id: string;
  feedItemId: string;
  userId: string;
  isLiked: boolean;
  likeCount: number;
  createdAt: string;
}

class LikeService {
  async getLikes(
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<LikeResponse>>> {
    // Note: This endpoint might need to be created on the backend
    // For now, we'll use a placeholder endpoint
    const response = await apiClient.get(`/likes?page=${page}&size=${size}`);
    return response.data;
  }

  async getLikesByFeedItem(
    feedItemId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<LikeResponse>>> {
    const response = await apiClient.get(
      `/likes/feed-item/${feedItemId}?page=${page}&size=${size}`
    );
    return response.data;
  }
}

export const likeService = new LikeService();

