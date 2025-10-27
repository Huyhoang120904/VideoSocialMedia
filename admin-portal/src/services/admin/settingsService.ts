import apiClient from "@/config/axios";
import { ApiResponse } from "../api";

export interface PlatformSettings {
  platformName: string;
  maintenanceMode: boolean;
  maxFileSize: number;
  allowedFileTypes: string[];
  sessionTimeout: number;
  enableRegistration: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  enableSMSAlerts: boolean;
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  dataRetentionDays: number;
  apiRateLimit: number;
}

export interface SettingsUpdateRequest {
  platformName?: string;
  maintenanceMode?: boolean;
  maxFileSize?: number;
  allowedFileTypes?: string[];
  sessionTimeout?: number;
  enableRegistration?: boolean;
  enableEmailNotifications?: boolean;
  enablePushNotifications?: boolean;
  enableSMSAlerts?: boolean;
  theme?: "light" | "dark" | "system";
  language?: string;
  timezone?: string;
  dataRetentionDays?: number;
  apiRateLimit?: number;
}

class SettingsService {
  async getSettings(): Promise<ApiResponse<PlatformSettings>> {
    // For now, return mock settings since we don't have a dedicated settings endpoint
    // In a real implementation, this would call a backend endpoint
    const mockSettings: PlatformSettings = {
      platformName: "TikTok Clone",
      maintenanceMode: false,
      maxFileSize: 20 * 1024 * 1024, // 20MB
      allowedFileTypes: ["video/mp4", "video/avi", "video/mov", "video/webm"],
      sessionTimeout: 3600, // 1 hour
      enableRegistration: true,
      enableEmailNotifications: true,
      enablePushNotifications: false,
      enableSMSAlerts: false,
      theme: "system",
      language: "en",
      timezone: "UTC",
      dataRetentionDays: 365,
      apiRateLimit: 1000,
    };

    return {
      code: 1000,
      message: "Settings retrieved successfully",
      timeStamp: new Date().toISOString(),
      result: mockSettings,
    };
  }

  async updateSettings(
    request: SettingsUpdateRequest
  ): Promise<ApiResponse<PlatformSettings>> {
    // For now, simulate updating settings
    // In a real implementation, this would call a backend endpoint
    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockSettings: PlatformSettings = {
        platformName: request.platformName || "TikTok Clone",
        maintenanceMode: request.maintenanceMode ?? false,
        maxFileSize: request.maxFileSize || 20 * 1024 * 1024,
        allowedFileTypes: request.allowedFileTypes || [
          "video/mp4",
          "video/avi",
          "video/mov",
          "video/webm",
        ],
        sessionTimeout: request.sessionTimeout || 3600,
        enableRegistration: request.enableRegistration ?? true,
        enableEmailNotifications: request.enableEmailNotifications ?? true,
        enablePushNotifications: request.enablePushNotifications ?? false,
        enableSMSAlerts: request.enableSMSAlerts ?? false,
        theme: request.theme || "system",
        language: request.language || "en",
        timezone: request.timezone || "UTC",
        dataRetentionDays: request.dataRetentionDays || 365,
        apiRateLimit: request.apiRateLimit || 1000,
      };

      return {
        code: 1000,
        message: "Settings updated successfully",
        timeStamp: new Date().toISOString(),
        result: mockSettings,
      };
    } catch (error) {
      console.error("Failed to update settings:", error);
      throw error;
    }
  }

  async exportData(): Promise<ApiResponse<{ downloadUrl: string }>> {
    // Simulate data export
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      return {
        code: 1000,
        message: "Data export completed successfully",
        timeStamp: new Date().toISOString(),
        result: {
          downloadUrl: "/api/admin/export/data.zip",
        },
      };
    } catch (error) {
      console.error("Failed to export data:", error);
      throw error;
    }
  }

  async createBackup(): Promise<ApiResponse<{ backupId: string }>> {
    // Simulate backup creation
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));

      return {
        code: 1000,
        message: "Backup created successfully",
        timeStamp: new Date().toISOString(),
        result: {
          backupId: `backup_${Date.now()}`,
        },
      };
    } catch (error) {
      console.error("Failed to create backup:", error);
      throw error;
    }
  }
}

export const settingsService = new SettingsService();

