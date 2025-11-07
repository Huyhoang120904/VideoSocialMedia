import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { FeedItem, ImageData } from "../Store/feedSlice";
import FeedItemResponse, {
    FeedItemType,
    ImageSlideResponse,
} from "../Types/response/FeedItemResponse";
import { getVideoUrl, getImageUrl } from "../Utils/ImageUrlHelper";
import { PaginatedResponse } from "../Types/response/PaginatedResponse";

export const fetchFeedItems = async (
    retryCount: number = 0
): Promise<ApiResponse<FeedItem[]>> => {
    const MAX_RETRIES = 3;

    try {
        const { data } =
            await api.get<ApiResponse<PaginatedResponse<FeedItemResponse>>>("/feed");

        console.log('=== FeedService: Raw API response ===');
        console.log('Total items:', data.result?.content?.length || 0);
        console.log('Full response:', JSON.stringify(data.result?.content, null, 2));

        data.result?.content?.forEach((item, index) => {
            console.log(`Item ${index + 1}:`, {
                id: item.id,
                type: item.feedItemType,
                hasVideo: !!item.video,
                hasImageSlide: !!item.imageSlide,
                imageSlideData: item.imageSlide,
                videoData: item.video ? 'has video' : 'no video'
            });
        });

        // Transform FeedItemResponse[] to FeedItem[]
        const feedItems: FeedItem[] =
            data.result?.content
                ?.map((feedItem: FeedItemResponse) => {
                    // Handle VIDEO type
                    if (
                        feedItem.feedItemType === FeedItemType.VIDEO &&
                        feedItem.video
                    ) {
                        const file = feedItem.video;
                        const videoUrl = getVideoUrl(file.url || file.secureUrl || "");

                        console.log('Video feedItem hashtags from API:', feedItem.hashTags);

                        const item: FeedItem = {
                            id: feedItem.id,
                            feedItemType: FeedItemType.VIDEO,
                            video: {
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
                                uri: videoUrl || "",
                            },
                            likes: feedItem.likeCount || 0,
                            comments: feedItem.commentCount || 0,
                            shares: feedItem.shareCount || 0,
                            outstanding: 0,
                            title: file.title || file.fileName || "Untitled Video",
                            description: file.description || "",
                            hashtags: feedItem.hashTags || [],
                        };
                        return item;
                    }

                    // Handle IMAGE_SLIDE type
                    if (
                        feedItem.feedItemType === FeedItemType.IMAGE_SLIDE &&
                        feedItem.imageSlide
                    ) {
                        console.log('=== Processing IMAGE_SLIDE ===');
                        console.log('ImageSlide raw data:', JSON.stringify(feedItem.imageSlide, null, 2));

                        const imageSlide = feedItem.imageSlide;
                        const images: ImageData[] = imageSlide.images.map((img: any) => {
                            const imageUrl = getImageUrl(img.url || img.secureUrl || "");
                            console.log('Processing image:', {
                                id: img.id,
                                originalUrl: img.url,
                                secureUrl: img.secureUrl,
                                processedUrl: imageUrl
                            });
                            return {
                                id: img.id,
                                url: img.url,
                                secureUrl: imageUrl,
                                thumbnailUrl: img.thumbnailUrl,
                                width: img.width,
                                height: img.height,
                            };
                        });

                        const item: FeedItem = {
                            id: feedItem.id,
                            feedItemType: FeedItemType.IMAGE_SLIDE,
                            imageSlide: {
                                id: imageSlide.id,
                                images: images,
                            },
                            likes: feedItem.likeCount || 0,
                            comments: feedItem.commentCount || 0,
                            shares: feedItem.shareCount || 0,
                            outstanding: 0,
                            title: imageSlide.images[0]?.title || "Image Slide",
                            description:
                                imageSlide.images[0]?.description || "Image Collection",
                            hashtags: feedItem.hashTags || [],
                        };
                        console.log('Created ImageSlide FeedItem:', item);
                        return item;
                    }

                    return null;
                })
                .filter((item): item is FeedItem => item !== null) || [];

        console.log('=== FeedService: Final transformed feed items ===');
        console.log('Total items:', feedItems.length);
        console.log('Video count:', feedItems.filter(item => item.feedItemType === FeedItemType.VIDEO).length);
        console.log('ImageSlide count:', feedItems.filter(item => item.feedItemType === FeedItemType.IMAGE_SLIDE).length);
        feedItems.forEach((item, index) => {
            console.log(`Feed item ${index + 1}:`, {
                id: item.id,
                type: item.feedItemType,
                title: item.title,
                hasImages: item.imageSlide?.images?.length || 0
            });
        });

        return {
            ...data,
            result: feedItems,
        };
    } catch (error: any) {
        console.error(`API Fetch Feed Error (attempt ${retryCount + 1}):`, error);

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
                `Retrying fetchFeedItems in ${(retryCount + 1) * 1000}ms...`
            );
            await new Promise((resolve) =>
                setTimeout(resolve, (retryCount + 1) * 1000)
            );
            return fetchFeedItems(retryCount + 1);
        }

        throw new Error(error.response?.data?.message || "Failed to fetch feed");
    }
};
