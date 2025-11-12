import apiClient from "@/config/axios";
import { ApiResponse } from "@/types";

export interface AnalyticsResponse {
  totalUsers: number;
  totalVideos: number;
  totalStorageUsed: number;
  activeUsersToday: number;
  videosUploadedToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  videosUploadedThisWeek: number;
  videosUploadedThisMonth: number;
  storageUsedThisMonth: number;
  formattedStorageUsed: string;
  totalInteractions: number;
  interactionsToday: number;
  totalComments: number;
  totalReports: number;
  pendingReports: number;
  userGrowthRate: number;
  videoGrowthRate: number;
  engagementRate: number;
  usersByRole: {
    role: string;
    count: number;
  }[];
  videosByType: {
    type: string;
    count: number;
    totalSize: number;
  }[];
  interactionsByType: {
    type: string;
    count: number;
  }[];
}

class AnalyticsService {
  async getDashboardAnalytics(): Promise<ApiResponse<AnalyticsResponse>> {
    try {
      const response = await apiClient.get("/admin/analytics/dashboard");

      console.log("Analytics response:", response.data);
      return response.data;
    } catch (error: unknown) {
      const err = error as {
        message?: string;
        response?: { data?: unknown; status?: number };
        config?: { url?: string };
        code?: string;
      };

      // Provide helpful error messages based on error type
      if (err.code === "ECONNREFUSED" || err.code === "ERR_NETWORK") {
        console.warn(
          "⚠️ Backend server is not running or not accessible.",
          "\n   Please ensure the Spring Boot backend is running on http://localhost:8082",
          "\n   Run: cd backend && mvnw spring-boot:run"
        );
      } else if (err.response?.status === 401) {
        console.warn(
          "⚠️ Authentication required.",
          "\n   Please log in to access analytics."
        );
      } else if (err.response?.status === 403) {
        console.warn(
          "⚠️ Access forbidden.",
          "\n   You need ADMIN role to access analytics."
        );
      } else {
        console.error("Failed to fetch analytics:", {
          message: err.message,
          status: err.response?.status,
          data: err.response?.data,
          url: err.config?.url,
        });
      }

      // Return mock data if backend is not available
      const mockAnalytics: AnalyticsResponse = {
        totalUsers: 0,
        totalVideos: 0,
        totalStorageUsed: 0,
        activeUsersToday: 0,
        videosUploadedToday: 0,
        newUsersThisWeek: 0,
        newUsersThisMonth: 0,
        videosUploadedThisWeek: 0,
        videosUploadedThisMonth: 0,
        storageUsedThisMonth: 0,
        formattedStorageUsed: "0 Bytes",
        totalInteractions: 0,
        interactionsToday: 0,
        totalComments: 0,
        totalReports: 0,
        pendingReports: 0,
        userGrowthRate: 0,
        videoGrowthRate: 0,
        engagementRate: 0,
        usersByRole: [
          { role: "ADMIN", count: 0 },
          { role: "USER", count: 0 },
        ],
        videosByType: [
          { type: "VIDEO", count: 0, totalSize: 0 },
          { type: "IMAGE", count: 0, totalSize: 0 },
        ],
        interactionsByType: [],
      };

      return {
        code: 1000,
        message:
          "Analytics retrieved successfully (mock data - backend unavailable)",
        timeStamp: new Date().toISOString(),
        result: mockAnalytics,
      };
    }
  }

  async getUserAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await apiClient.get("/admin/analytics/users");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch user analytics:", error);
      throw error;
    }
  }

  async getVideoAnalytics(): Promise<ApiResponse<Record<string, unknown>>> {
    try {
      const response = await apiClient.get("/admin/analytics/videos");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch video analytics:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
