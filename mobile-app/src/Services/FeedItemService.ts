import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import {
  PaginatedResponse,
  VideoListResponse,
} from "../Types/response/PaginatedResponse";
import {
  getVideoUrl,
  getThumbnailUrl,
  getImageUrl,
} from "../Utils/ImageUrlHelper";
import FeedItemResponse, {
  FeedItemType,
} from "../Types/response/FeedItemResponse";

export interface FeedItemListResponse {
  feedItems: PaginatedResponse<any>;
  message?: string;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

export interface VideoItem {
  id: string;
  uri: string;
  title: string;
  likes: number;
  comments: number;
  shares: number;
  outstanding: number;
  thumbnailUrl?: string;
  feedItemType?: FeedItemType;
}

export const fetchFeedItemsByUserId = async (
  userId: string,
  page: number = 0,
  size: number = 50
): Promise<ApiResponse<VideoListResponse<VideoItem>>> => {
  try {
    const { data } = await api.get<ApiResponse<FeedItemListResponse>>(
      `/feed-items/user/${userId}`,
      {
        params: { page, size },
      }
    );

    // Transform feed items to VideoItem[]
    // The backend returns FeedItemUploadResponse in a Page, but we'll handle it as FeedItemResponse-like structure
    const videoItems: VideoItem[] =
      data.result?.feedItems?.content
        ?.map((feedItem: any) => {
          // Process VIDEO type feed items
          if (feedItem.feedItemType === FeedItemType.VIDEO && feedItem.video) {
            const file = feedItem.video;
            const videoUrl = getVideoUrl(file.url || file.secureUrl || "");
            const thumbnailUrl = file.thumbnailUrl
              ? getThumbnailUrl(file.thumbnailUrl)
              : feedItem.thumbnailUrl
                ? getThumbnailUrl(feedItem.thumbnailUrl)
                : undefined;

            const videoItem: VideoItem = {
              id: feedItem.feedItemId || feedItem.id,
              uri: videoUrl || "",
              title:
                feedItem.title ||
                file.title ||
                file.fileName ||
                "Untitled Video",
              likes: feedItem.likeCount ?? 0,
              comments: feedItem.commentCount ?? 0,
              shares: feedItem.shareCount ?? 0,
              outstanding: 0,
              thumbnailUrl: thumbnailUrl,
              feedItemType: FeedItemType.VIDEO,
            };
            console.log("VideoItem metadata:", {
              id: videoItem.id,
              likes: videoItem.likes,
              comments: videoItem.comments,
              shares: videoItem.shares,
              backendLikeCount: feedItem.likeCount,
            });
            return videoItem;
          }

          // Process IMAGE_SLIDE type feed items
          if (
            feedItem.feedItemType === FeedItemType.IMAGE_SLIDE &&
            feedItem.images &&
            feedItem.images.length > 0
          ) {
            // Use the first image as the thumbnail
            const firstImage = feedItem.images[0];
            const imageUrl = getImageUrl(
              firstImage.url || firstImage.secureUrl || ""
            );

            const imageSlideItem: VideoItem = {
              id: feedItem.feedItemId || feedItem.id,
              uri: imageUrl || "", // For IMAGE_SLIDE, uri points to the first image
              title: feedItem.title || feedItem.captions || "Image Slide",
              likes: feedItem.likeCount ?? 0,
              comments: feedItem.commentCount ?? 0,
              shares: feedItem.shareCount ?? 0,
              outstanding: 0,
              thumbnailUrl: imageUrl || undefined, // Use first image as thumbnail
              feedItemType: FeedItemType.IMAGE_SLIDE,
            };
            console.log("ImageSlideItem metadata:", {
              id: imageSlideItem.id,
              likes: imageSlideItem.likes,
              comments: imageSlideItem.comments,
              shares: imageSlideItem.shares,
              backendLikeCount: feedItem.likeCount,
            });
            return imageSlideItem;
          }

          return null;
        })
        .filter(
          (item): item is VideoItem => item !== null && item !== undefined
        ) || [];

    const videoListResponse: VideoListResponse<VideoItem> = {
      videos: videoItems,
      totalElements: data.result?.totalElements || 0,
      totalPages: data.result?.totalPages || 0,
    };

    return {
      ...data,
      result: videoListResponse,
    };
  } catch (error: any) {
    console.error("API Fetch Feed Items By User ID Error:", error);

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

export const getFeedItemById = async (
  feedItemId: string
): Promise<ApiResponse<FeedItemResponse>> => {
  try {
    const { data } = await api.get<ApiResponse<FeedItemResponse>>(
      `/feed-items/${feedItemId}`
    );
    return data;
  } catch (error: any) {
    console.error("API Get Feed Item By ID Error:", error);
    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log("Response Data:", error.response.data);
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch feed item"
    );
  }
};

export const uploadFeedItem = async (
  formData: FormData,
  onUploadProgress?: (progressEvent: any) => void
): Promise<ApiResponse<any>> => {
  try {
    const { data } = await api.post<ApiResponse<any>>(
      "/feed-items/upload",
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
    console.error("API Upload Feed Item Error:", error);

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
      error.response?.data?.message || "Failed to upload feed item"
    );
  }
};
