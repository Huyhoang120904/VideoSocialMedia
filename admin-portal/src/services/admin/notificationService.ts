import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

export interface NotificationResponse {
  id: string;
  type: string;
  title: string;
  content: string;
  userId: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

class NotificationService {
  async getNotifications(
    page: number = 0,
    size: number = 20,
    unreadOnly: boolean = false
  ): Promise<ApiResponse<PagedResponse<NotificationResponse>>> {
    const response = await apiClient.get(
      `/notifications?page=${page}&size=${size}&unreadOnly=${unreadOnly}`
    );
    return response.data;
  }

  async markAsRead(notificationId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.patch(
      `/notifications/${notificationId}/read`
    );
    return response.data;
  }

  async markAllAsRead(): Promise<ApiResponse<void>> {
    const response = await apiClient.patch("/notifications/read-all");
    return response.data;
  }
}

export const notificationService = new NotificationService();

