import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { Video } from "../Store/videoSlice";
import FileResponse from "../Types/response/FileResponse";
import FeedItemResponse from "../Types/response/FeedItemResponse";
import { getVideoUrl } from "../Utils/ImageUrlHelper";
import {
  PaginatedResponse,
  VideoListResponse,
} from "../Types/response/PaginatedResponse";

export const fetchVideos = async (
  retryCount: number = 0
): Promise<ApiResponse<Video[]>> => {
  const MAX_RETRIES = 3;

  try {
    const { data } = await api.get<ApiResponse<PaginatedResponse>>("/videos");

    // Transform FileResponse[] to Video[]
    const videos: Video[] =
      data.result?.content?.map((file: FileResponse) => {
        // Use helper function to get correct video URL for current platform
        const videoUrl = getVideoUrl(file.url || file.secureUrl || "");

        const video: Video = {
          id: file.id,
          fileName: file.fileName,
          size: file.size,
          url: file.url,
          secureUrl: file.secureUrl || undefined,
          format: file.format,
          resourceType: file.resourceType,
          title: file.title || file.fileName || "Untitled Video",
          description: file.description || "",
          thumbnailUrl: file.thumbnailUrl,
          // Frontend-specific computed fields
          uri: videoUrl || "", // Ensure uri is never undefined
          likes: 0, // Default values since FileResponse doesn't have these
          comments: 0,
          shares: 0,
          outstanding: 0,
        };
        return video;
      }) || [];

    return {
      ...data,
      result: videos,
    };
  } catch (error: any) {
    // Log detailed API error information
    console.error(`API Fetch Videos Error (attempt ${retryCount + 1}):`, error);

    // Log request details
    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log(
        "Request Headers:",
        JSON.stringify(error.config.headers, null, 2)
      );
    }

    // Log response details if available
    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    }

    // Retry logic for network errors
    if (
      retryCount < MAX_RETRIES &&
      (error.code === "NETWORK_ERROR" ||
        error.message?.includes("Network Error") ||
        error.message?.includes("timeout") ||
        !error.response)
    ) {
      console.log(`Retrying fetchVideos in ${(retryCount + 1) * 1000}ms...`);
      await new Promise((resolve) =>
        setTimeout(resolve, (retryCount + 1) * 1000)
      );
      return fetchVideos(retryCount + 1);
    }

    throw new Error(error.response?.data?.message || "Failed to fetch videos");
  }
};

export const fetchVideosByUserId = async (
  userId: string,
  page: number = 0,
  size: number = 10
): Promise<ApiResponse<VideoListResponse<Video>>> => {
  try {
    const { data } = await api.get<ApiResponse<PaginatedResponse>>(
      `/videos/user/${userId}`,
      {
        params: { page, size },
      }
    );

    // Transform FileResponse[] to Video[]
    const videos: Video[] =
      data.result?.content?.map((file: FileResponse) => {
        // Use helper function to get correct video URL for current platform
        const videoUrl = getVideoUrl(file.url || file.secureUrl || "");

        return {
          id: file.id,
          fileName: file.fileName,
          size: file.size,
          url: file.url,
          secureUrl: file.secureUrl || undefined,
          format: file.format,
          resourceType: file.resourceType,
          title: file.title || file.fileName || "Untitled Video",
          description: file.description || "",
          thumbnailUrl: file.thumbnailUrl,
          // Frontend-specific computed fields
          uri: videoUrl || "", // Ensure uri is never undefined
          likes: 0, // Default values since FileResponse doesn't have these
          comments: 0,
          shares: 0,
          outstanding: 0,
        };
      }) || [];

    const videoListResponse: VideoListResponse<Video> = {
      videos,
      totalElements: data.result?.totalElements || 0,
      totalPages: data.result?.totalPages || 0,
    };

    return {
      ...data,
      result: videoListResponse,
    };
  } catch (error: any) {
    // Log detailed API error information
    console.error("API Fetch User Videos Error:", error);

    // Log request details
    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log(
        "Request Headers:",
        JSON.stringify(error.config.headers, null, 2)
      );
    }

    // Log response details if available
    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    }

    throw new Error(
      error.response?.data?.message || "Failed to fetch user videos"
    );
  }
};

export const fetchFeed = async (
  retryCount: number = 0
): Promise<ApiResponse<Video[]>> => {
  const MAX_RETRIES = 3;

  try {
    const { data } =
      await api.get<ApiResponse<PaginatedResponse<FeedItemResponse>>>("/feed");

    // Transform FeedItemResponse[] to Video[]
    const videos: Video[] =
      data.result?.content
        ?.map((feedItem: FeedItemResponse) => {
          if (!feedItem.video) {
            return null;
          }

          const file = feedItem.video;
          // Use helper function to get correct video URL for current platform
          const videoUrl = getVideoUrl(file.url || file.secureUrl || "");

          const video: Video = {
            id: feedItem.id,
            fileName: file.fileName,
            size: file.size,
            url: file.url,
            secureUrl: file.secureUrl || undefined,
            format: file.format,
            resourceType: file.resourceType,
            title: file.title || file.fileName || "Untitled Video",
            description: file.description || "",
            thumbnailUrl: file.thumbnailUrl,
            // Frontend-specific computed fields
            uri: videoUrl || "", // Ensure uri is never undefined
            likes: feedItem.likeCount || 0,
            comments: feedItem.commentCount || 0,
            shares: feedItem.shareCount || 0,
            outstanding: 0,
          };
          return video;
        })
        .filter((video): video is Video => video !== null) || [];

    return {
      ...data,
      result: videos,
    };
  } catch (error: any) {
    // Log detailed API error information
    console.error(`API Fetch Feed Error (attempt ${retryCount + 1}):`, error);

    // Log request details
    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log(
        "Request Headers:",
        JSON.stringify(error.config.headers, null, 2)
      );
    }

    // Log response details if available
    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    }

    // Retry logic for network errors
    if (
      retryCount < MAX_RETRIES &&
      (error.code === "NETWORK_ERROR" ||
        error.message?.includes("Network Error") ||
        error.message?.includes("timeout") ||
        !error.response)
    ) {
      console.log(`Retrying fetchFeed in ${(retryCount + 1) * 1000}ms...`);
      await new Promise((resolve) =>
        setTimeout(resolve, (retryCount + 1) * 1000)
      );
      return fetchFeed(retryCount + 1);
    }

    throw new Error(error.response?.data?.message || "Failed to fetch feed");
  }
};

export const uploadVideo = async (
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse<any>> => {
  try {
    const { data } = await api.post<ApiResponse<any>>(
      "/videos/upload",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress,
      }
    );

    return data;
  } catch (error: any) {
    console.error("API Upload Video Error:", error);

    // Log request details
    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log(
        "Request Headers:",
        JSON.stringify(error.config.headers, null, 2)
      );
    }

    // Log response details if available
    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    }

    throw new Error(error.response?.data?.message || "Failed to upload video");
  }
};
