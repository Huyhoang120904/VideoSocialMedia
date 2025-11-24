import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

export interface ViewResponse {
  id: string;
  feedItemId: string;
  userId: string;
  viewCount: number;
  createdAt: string;
}

class ViewService {
  async getViews(
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<ViewResponse>>> {
    // Note: This endpoint might need to be created on the backend
    // For now, we'll use a placeholder endpoint
    const response = await apiClient.get(`/views?page=${page}&size=${size}`);
    return response.data;
  }

  async getViewsByFeedItem(
    feedItemId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<ViewResponse>>> {
    const response = await apiClient.get(
      `/views/feed-item/${feedItemId}?page=${page}&size=${size}`
    );
    return response.data;
  }
}

export const viewService = new ViewService();

