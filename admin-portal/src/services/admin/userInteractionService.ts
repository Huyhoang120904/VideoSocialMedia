import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

export interface UserInteractionResponse {
  id: string;
  userId: string;
  feedItemId: string;
  interactionType: string;
  duration?: number;
  timestamp: string;
}

export interface UserInteractionRequest {
  userId: string;
  feedItemId: string;
  interactionType: string;
  duration?: number;
}

class UserInteractionService {
  async getUserInteractions(
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<UserInteractionResponse>>> {
    // Note: This endpoint might need to be created on the backend
    // For now, we'll use a placeholder endpoint
    const response = await apiClient.get(
      `/user-interactions?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getUserInteractionsByUser(
    userId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<UserInteractionResponse>>> {
    const response = await apiClient.get(
      `/user-interactions/user/${userId}?page=${page}&size=${size}`
    );
    return response.data;
  }
}

export const userInteractionService = new UserInteractionService();

