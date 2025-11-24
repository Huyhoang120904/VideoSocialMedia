import apiClient from "@/config/axios";
import {
  ApiResponse,
  FeedItemUploadResponse,
  FeedItemResponse,
  FeedItemListResponse,
  UploadFeedItemRequest,
  FeedItemType,
  PagedResponse,
} from "@/types";

export type { FeedItemResponse };

class FeedItemService {
  /**
   * Get all feed items with pagination
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   */
  async getFeedItems(
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<FeedItemListResponse>> {
    const response = await apiClient.get(
      `/feed-items?page=${page}&size=${size}`
    );
    return response.data;
  }

  /**
   * Get feed items by user ID
   * @param userId User ID
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   */
  async getFeedItemsByUserId(
    userId: string,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<FeedItemListResponse>> {
    const response = await apiClient.get(
      `/feed-items/user/${userId}?page=${page}&size=${size}`
    );
    return response.data;
  }

  /**
   * Get feed items by type
   * @param feedItemType Type of feed item (VIDEO, IMAGE_SLIDE, USER_DETAIL)
   * @param page Page number (0-indexed)
   * @param size Number of items per page
   */
  async getFeedItemsByType(
    feedItemType: FeedItemType,
    page: number = 0,
    size: number = 10
  ): Promise<ApiResponse<FeedItemListResponse>> {
    const response = await apiClient.get(
      `/feed-items/type/${feedItemType}?page=${page}&size=${size}`
    );
    return response.data;
  }

  /**
   * Upload a new feed item
   * @param request Upload feed item request
   */
  async uploadFeedItem(
    request: UploadFeedItemRequest
  ): Promise<ApiResponse<FeedItemUploadResponse>> {
    const formData = new FormData();

    // Add feedItemType
    formData.append("feedItemType", request.feedItemType);

    // Add common fields
    if (request.title) {
      formData.append("title", request.title);
    }
    if (request.description) {
      formData.append("description", request.description);
    }
    if (request.thumbnail) {
      formData.append("thumbnail", request.thumbnail);
    }
    if (request.hashTags && request.hashTags.length > 0) {
      formData.append("hashTags", request.hashTags.join(","));
    }

    // Add video-specific fields
    if (request.feedItemType === FeedItemType.VIDEO) {
      if (request.videoFile) {
        formData.append("videoFile", request.videoFile);
      }
      if (request.duration) {
        formData.append("duration", request.duration.toString());
      }
    }

    // Add image-slide-specific fields
    if (request.feedItemType === FeedItemType.IMAGE_SLIDE) {
      if (request.images && request.images.length > 0) {
        request.images.forEach((image) => {
          formData.append("images", image);
        });
      }
      if (request.captions) {
        formData.append("captions", request.captions);
      }
    }

    const response = await apiClient.post("/feed-items/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Delete a feed item
   * @param feedItemId Feed item ID to delete
   */
  async deleteFeedItem(feedItemId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/feed-items/${feedItemId}`);
    return response.data;
  }

  /**
   * Get feed item by ID
   * @param feedItemId Feed item ID
   */
  async getFeedItemById(
    feedItemId: string
  ): Promise<ApiResponse<FeedItemResponse>> {
    const response = await apiClient.get(`/feed-items/${feedItemId}`);
    return response.data;
  }

  /**
   * Disable feed item due to violation
   * @param feedItemId Feed item ID to disable
   */
  async disableFeedItem(feedItemId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.put(`/feed-items/${feedItemId}/disable`);
    return response.data;
  }
}

export const feedItemService = new FeedItemService();

