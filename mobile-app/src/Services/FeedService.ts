import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { FeedItem } from "../Store/feedSlice";
import FeedItemResponse from "../Types/response/FeedItemResponse";
import { PaginatedResponse } from "../Types/response/PaginatedResponse";
import { mapFeedItemResponses } from "../Utils/feedItemMapper";
import { PageResponse } from "../Types/response/PageResponse";

const MAX_RETRIES = 3;

interface FeedFetchOptions {
  page?: number;
  size?: number;
}

interface ViewResponse {
  feedItemId: string;
  viewsCount: number;
  watched: boolean;
}

const fetchFeedFromEndpoint = async (
  endpoint: string,
  retryCount: number = 0,
  options?: FeedFetchOptions
): Promise<ApiResponse<FeedItem[]>> => {
  try {
    const { data } = await api.get<
      ApiResponse<PaginatedResponse<FeedItemResponse>>
    >(endpoint, {
      params: {
        page: options?.page ?? 0,
        size: options?.size ?? 10,
      },
    });

    console.log(`=== FeedService (${endpoint}) response ===`);
    console.log("Total items:", data.result?.content?.length || 0);

    // Transform FeedItemResponse[] to FeedItem[]
    const feedItems: FeedItem[] = mapFeedItemResponses(
      data.result?.content || []
    );

    return {
      ...data,
      result: feedItems,
    };
  } catch (error: any) {
    console.error(
      `API Fetch Feed ${endpoint} Error (attempt ${retryCount + 1}):`,
      error
    );

    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log(
        "Request Headers:",
        JSON.stringify(error.config.headers, null, 2)
      );
    }

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
      console.log(
        `Retrying fetch ${endpoint} in ${(retryCount + 1) * 1000}ms...`
      );
      await new Promise((resolve) =>
        setTimeout(resolve, (retryCount + 1) * 1000)
      );
      return fetchFeedFromEndpoint(endpoint, retryCount + 1, options);
    }

    throw new Error(
      error.response?.data?.message || "Failed to fetch feed items"
    );
  }
};

export const fetchFeedItems = async (
  retryCount: number = 0
): Promise<ApiResponse<FeedItem[]>> => {
  console.log("fetchFeedItems called ------------------------");
  return fetchFeedFromEndpoint("/feed/personal", retryCount);
};

export const fetchExploreFeedItems = async (
  options?: FeedFetchOptions
): Promise<ApiResponse<FeedItem[]>> => {
  return fetchFeedFromEndpoint("/feed/explore", 0, {
    page: options?.page,
    size: options?.size ?? 20,
  });
};

export const fetchFollowingFeedItems = async (
  options?: FeedFetchOptions
): Promise<ApiResponse<FeedItem[]>> => {
  return fetchFeedFromEndpoint("/feed/following", 0, {
    page: options?.page,
    size: options?.size ?? 10,
  });
};

export const fetchUserFeedItems = async (
  userDetailId: string,
  options?: FeedFetchOptions
): Promise<ApiResponse<FeedItem[]>> => {
  try {
    const { data } = await api.get<ApiResponse<PageResponse<FeedItemResponse>>>(
      `/feed-items/user/${userDetailId}`,
      {
        params: {
          page: options?.page ?? 0,
          size: options?.size ?? 30,
        },
      }
    );

    const content = data.result?.content || [];
    const feedItems = mapFeedItemResponses(content);

    return {
      ...data,
      result: feedItems,
    };
  } catch (error: any) {
    console.error("API Fetch User Feed Error:", error);

    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log(
        "Request Headers:",
        JSON.stringify(error.config.headers, null, 2)
      );
    }

    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    }

    throw new Error(
      error.response?.data?.message || "Failed to fetch user feed items"
    );
  }
};

export const fetchLovedFeedItemsList = async (
  options?: FeedFetchOptions
): Promise<ApiResponse<FeedItem[]>> => {
  return fetchFeedFromEndpoint("/feed-items/loved", 0, {
    page: options?.page,
    size: options?.size ?? 30,
  });
};

/**
 * Toggle love status for a feed item
 * @param feedItemId - ID of the feed item
 * @param isCurrentlyLoved - Current love status
 * @returns Promise with updated love status and count
 */
export const toggleLove = async (
  feedItemId: string,
  isCurrentlyLoved: boolean
): Promise<{ loved: boolean; loveCount: number }> => {
  try {
    if (isCurrentlyLoved) {
      // Remove love
      const { data } = await api.delete<
        ApiResponse<{ loved: boolean; loveCount: number }>
      >(`/feed-items/${feedItemId}/love`);
      return data.result || { loved: false, loveCount: 0 };
    } else {
      // Add love
      const { data } = await api.post<
        ApiResponse<{ loved: boolean; loveCount: number }>
      >(`/feed-items/${feedItemId}/love`);
      return data.result || { loved: true, loveCount: 1 };
    }
  } catch (error: any) {
    console.error("Toggle love error:", error);
    throw new Error(error.response?.data?.message || "Failed to toggle love");
  }
};

/**
 * Check love status for a feed item
 * @param feedItemId - ID of the feed item
 * @returns Promise with love status and count
 */
export const checkLoveStatus = async (
  feedItemId: string
): Promise<{ loved: boolean; loveCount: number }> => {
  try {
    const { data } = await api.get<
      ApiResponse<{ loved: boolean; loveCount: number }>
    >(`/feed-items/${feedItemId}/love`);
    return data.result || { loved: false, loveCount: 0 };
  } catch (error: any) {
    console.error("Check love status error:", error);
    throw new Error(
      error.response?.data?.message || "Failed to check love status"
    );
  }
};

export const recordFeedItemView = async (
  feedItemId: string
): Promise<ViewResponse> => {
  try {
    const { data } = await api.post<ApiResponse<ViewResponse>>(
      `/feed-items/${feedItemId}/view`
    );

    if (data.result) {
      return data.result;
    }

    return {
      feedItemId,
      viewsCount: 0,
      watched: true,
    };
  } catch (error: any) {
    console.error("Record view error:", error);
    throw new Error(error.response?.data?.message || "Failed to record view");
  }
};
