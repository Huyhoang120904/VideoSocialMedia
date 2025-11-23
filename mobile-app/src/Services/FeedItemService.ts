import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { VideoListResponse } from "../Types/response/PaginatedResponse";
import { PageResponse } from "../Types/response/PageResponse";
import {
  getVideoUrl,
  getThumbnailUrl,
  getImageUrl,
} from "../Utils/ImageUrlHelper";
import FeedItemResponse, {
  FeedItemType,
} from "../Types/response/FeedItemResponse";

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
  uploaderId?: string;
  uploaderName?: string;
  loved?: boolean;
}

const mapFeedItemsToVideoItems = (
  feedItems?: FeedItemResponse[]
): VideoItem[] => {
  if (!feedItems || feedItems.length === 0) {
    return [];
  }

  return (
    feedItems
      ?.map((feedItem: FeedItemResponse) => {
        const baseVideoItem = {
          id: feedItem.id,
          likes: feedItem.likeCount ?? 0,
          comments: feedItem.commentCount ?? 0,
          shares: feedItem.shareCount ?? 0,
          outstanding: 0,
          uploaderId: feedItem.uploader?.id,
          uploaderName:
            feedItem.uploader?.displayName ||
            feedItem.uploader?.shownName ||
            undefined,
          loved: feedItem.loved,
        };

        if (feedItem.feedItemType === FeedItemType.VIDEO && feedItem.video) {
          const file = feedItem.video;
          const videoUrl = getVideoUrl(file.url || file.secureUrl || "");
          const thumbnailUrl = file.thumbnailUrl
            ? getThumbnailUrl(file.thumbnailUrl)
            : undefined;

          return {
            ...baseVideoItem,
            uri: videoUrl || "",
            title:
              feedItem.title ||
              file.title ||
              file.fileName ||
              "Untitled Video",
            thumbnailUrl,
            feedItemType: FeedItemType.VIDEO,
          };
        }

        if (
          feedItem.feedItemType === FeedItemType.IMAGE_SLIDE &&
          feedItem.imageSlide &&
          feedItem.imageSlide.images.length > 0
        ) {
          const firstImage = feedItem.imageSlide.images[0];
          const imageUrl = getImageUrl(
            firstImage.url || firstImage.secureUrl || ""
          );

          return {
            ...baseVideoItem,
            uri: imageUrl || "",
            title:
              feedItem.title ||
              feedItem.description ||
              firstImage.title ||
              "Image Slide",
            thumbnailUrl: imageUrl || undefined,
            feedItemType: FeedItemType.IMAGE_SLIDE,
          };
        }

        return null;
      })
      .filter(
        (item): item is VideoItem => item !== null && item !== undefined
      ) || []
  );
};

const buildVideoListResponse = (
  pageResponse?: PageResponse<FeedItemResponse>
): VideoListResponse<VideoItem> => ({
  videos: mapFeedItemsToVideoItems(pageResponse?.content),
  totalElements: pageResponse?.totalElements || 0,
  totalPages: pageResponse?.totalPages || 0,
});

export const fetchFeedItemsByUserId = async (
  userId: string,
  page: number = 0,
  size: number = 50
): Promise<ApiResponse<VideoListResponse<VideoItem>>> => {
  try {
    const { data } = await api.get<ApiResponse<PageResponse<FeedItemResponse>>>(
      `/feed-items/user/${userId}`,
      {
        params: { page, size },
      }
    );

    const videoListResponse = buildVideoListResponse(data.result);

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

export const fetchLovedFeedItems = async (
  page: number = 0,
  size: number = 50
): Promise<ApiResponse<VideoListResponse<VideoItem>>> => {
  try {
    const { data } = await api.get<ApiResponse<PageResponse<FeedItemResponse>>>(
      "/feed-items/loved",
      {
        params: { page, size },
      }
    );

    const videoListResponse = buildVideoListResponse(data.result);

    return {
      ...data,
      result: videoListResponse,
    };
  } catch (error: any) {
    console.error("API Fetch Loved Feed Items Error:", error);

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
      error.response?.data?.message || "Failed to fetch loved feed items"
    );
  }
};
