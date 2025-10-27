import apiClient from "@/config/axios";
import { ApiResponse } from "../api";

export interface AnalyticsResponse {
  totalUsers: number;
  totalVideos: number;
  totalStorageUsed: number;
  activeUsersToday: number;
  videosUploadedToday: number;
  usersByRole: {
    role: string;
    count: number;
  }[];
  videosByType: {
    type: string;
    count: number;
  }[];
  storageByMonth: {
    month: string;
    size: number;
  }[];
}

class AnalyticsService {
  async getDashboardAnalytics(): Promise<ApiResponse<AnalyticsResponse>> {
    // For now, we'll aggregate data from existing endpoints
    // In a real implementation, you'd have dedicated analytics endpoints
    try {
      const [usersResponse, videosResponse] = await Promise.all([
        apiClient.get("/users?page=0&size=1"),
        apiClient.get("/videos?page=0&size=1"),
      ]);

      const totalUsers = usersResponse.data.result?.totalElements || 0;
      const totalVideos = videosResponse.data.result?.totalElements || 0;

      // Mock analytics data - replace with real analytics endpoints when available
      const analyticsData: AnalyticsResponse = {
        totalUsers,
        totalVideos,
        totalStorageUsed: 0, // Calculate from video sizes
        activeUsersToday: Math.floor(totalUsers * 0.1), // Mock: 10% active
        videosUploadedToday: Math.floor(totalVideos * 0.05), // Mock: 5% uploaded today
        usersByRole: [
          { role: "ADMIN", count: Math.floor(totalUsers * 0.05) },
          { role: "USER", count: Math.floor(totalUsers * 0.95) },
        ],
        videosByType: [
          { type: "VIDEO", count: totalVideos },
          { type: "IMAGE", count: 0 },
        ],
        storageByMonth: [
          { month: "2024-01", size: 1024 * 1024 * 100 }, // Mock data
          { month: "2024-02", size: 1024 * 1024 * 150 },
          { month: "2024-03", size: 1024 * 1024 * 200 },
        ],
      };

      return {
        code: 1000,
        message: "Analytics retrieved successfully",
        timeStamp: new Date().toISOString(),
        result: analyticsData,
      };
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
      console.error("Analytics error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url,
      });

      // Return mock data if backend is not available
      const mockAnalytics: AnalyticsResponse = {
        totalUsers: 0,
        totalVideos: 0,
        totalStorageUsed: 0,
        activeUsersToday: 0,
        videosUploadedToday: 0,
        usersByRole: [
          { role: "ADMIN", count: 0 },
          { role: "USER", count: 0 },
        ],
        videosByType: [
          { type: "VIDEO", count: 0 },
          { type: "IMAGE", count: 0 },
        ],
        storageByMonth: [],
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

  async getVideoAnalytics(): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.get("/videos?page=0&size=100");
      const videos = response.data.result?.content || [];

      const analytics = {
        totalVideos: videos.length,
        totalSize: videos.reduce(
          (sum: number, video: any) => sum + (video.size || 0),
          0
        ),
        averageSize:
          videos.length > 0
            ? videos.reduce(
                (sum: number, video: any) => sum + (video.size || 0),
                0
              ) / videos.length
            : 0,
        videosByFormat: videos.reduce((acc: any, video: any) => {
          const format = video.format || "unknown";
          acc[format] = (acc[format] || 0) + 1;
          return acc;
        }, {}),
      };

      return {
        code: 1000,
        message: "Video analytics retrieved successfully",
        timeStamp: new Date().toISOString(),
        result: analytics,
      };
    } catch (error) {
      console.error("Failed to fetch video analytics:", error);
      throw error;
    }
  }
}

export const analyticsService = new AnalyticsService();
