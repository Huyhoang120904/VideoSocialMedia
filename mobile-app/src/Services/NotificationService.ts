import { api } from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import Page from "../Types/response/Page";
import { NotificationResponse } from "../Types/response/NotificationResponse";
import { PaginationParams } from "../Types/request";

const NotificationService = {
  // Get notifications with pagination support
  getNotifications: async (
    params?: PaginationParams & { unreadOnly?: boolean }
  ): Promise<ApiResponse<Page<NotificationResponse>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());
    if (params?.unreadOnly !== undefined)
      queryParams.append("unreadOnly", params.unreadOnly.toString());

    const url = `/notifications${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    const response = await api.get(url);
    return response.data;
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string): Promise<ApiResponse<void>> => {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  // Mark all notifications as read
  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  },
};

export default NotificationService;
