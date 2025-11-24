import apiClient from "@/config/axios";
import { normalizePagedResult } from "@/lib/pagination";
import { ApiResponse, PagedResponse } from "@/types";

export interface UserInteractionResponse {
  id: string;
  userId: string;
  feedItemId: string;
  interactionType: string;
  duration?: number;
  watchPercentage?: number;
  interactionWeight?: number;
  timestamp: string;
}

class UserInteractionService {
  async getUserInteractions(
    page: number = 0,
    size: number = 20,
    userDetailId?: string
  ): Promise<ApiResponse<PagedResponse<UserInteractionResponse>>> {
    const baseUrl = userDetailId
      ? `/user-interactions/user/${userDetailId}`
      : "/user-interactions";

    const response = await apiClient.get<
      ApiResponse<PagedResponse<UserInteractionResponse>>
    >(`${baseUrl}?page=${page}&size=${size}`);

    const data = response.data;

    return {
      ...data,
      result: normalizePagedResult<UserInteractionResponse>(data.result),
    };
  }

  async getUserInteractionsByUser(
    userDetailId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<UserInteractionResponse>>> {
    return this.getUserInteractions(page, size, userDetailId);
  }
}

export const userInteractionService = new UserInteractionService();

