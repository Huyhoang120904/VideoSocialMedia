import { FeedItem, ImageData } from "../Store/feedSlice";
import FeedItemResponse, {
  FeedItemType,
  ImageSlideResponse,
} from "../Types/response/FeedItemResponse";
import { getImageUrl, getVideoUrl } from "./ImageUrlHelper";

const buildVideoFeedItem = (
  feedItem: FeedItemResponse
): FeedItem | null => {
  if (feedItem.feedItemType !== FeedItemType.VIDEO || !feedItem.video) {
    return null;
  }

  const file = feedItem.video;
  const videoUrl = getVideoUrl(file.url || file.secureUrl || "");

  return {
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
      duration: file.duration,
      title: file.title || file.fileName || "Untitled Video",
      description: file.description || "",
      thumbnailUrl: file.thumbnailUrl,
      uri: videoUrl || "",
    },
    likes: feedItem.likeCount || 0,
    comments: feedItem.commentCount || 0,
    shares: feedItem.shareCount || 0,
    outstanding: 0,
    title:
      feedItem.title || file.title || file.fileName || "Untitled Video",
    description: feedItem.description || file.description || "",
    hashtags: feedItem.hashTags || [],
    loved: feedItem.loved || false,
    uploader: feedItem.uploader,
  };
};

const mapImageSlide = (
  imageSlide: ImageSlideResponse
): ImageData[] => {
  return imageSlide.images.map((img: any) => {
    const imageUrl = getImageUrl(img.url || img.secureUrl || "");
    return {
      id: img.id,
      url: img.url,
      secureUrl: imageUrl,
      thumbnailUrl: img.thumbnailUrl,
      width: img.width,
      height: img.height,
    };
  });
};

const buildImageSlideFeedItem = (
  feedItem: FeedItemResponse
): FeedItem | null => {
  if (
    feedItem.feedItemType !== FeedItemType.IMAGE_SLIDE ||
    !feedItem.imageSlide
  ) {
    return null;
  }

  const images = mapImageSlide(feedItem.imageSlide);

  return {
    id: feedItem.id,
    feedItemType: FeedItemType.IMAGE_SLIDE,
    imageSlide: {
      id: feedItem.imageSlide.id,
      images,
    },
    likes: feedItem.likeCount || 0,
    comments: feedItem.commentCount || 0,
    shares: feedItem.shareCount || 0,
    outstanding: 0,
    title:
      feedItem.title ||
      feedItem.imageSlide.images[0]?.title ||
      "Image Slide",
    description:
      feedItem.description ||
      feedItem.imageSlide.images[0]?.description ||
      "Image Collection",
    hashtags: feedItem.hashTags || [],
    loved: feedItem.loved || false,
    uploader: feedItem.uploader,
  };
};

export const mapFeedItemResponseToFeedItem = (
  feedItem: FeedItemResponse
): FeedItem | null => {
  if (!feedItem) {
    return null;
  }

  if (feedItem.feedItemType === FeedItemType.VIDEO) {
    return buildVideoFeedItem(feedItem);
  }

  if (feedItem.feedItemType === FeedItemType.IMAGE_SLIDE) {
    return buildImageSlideFeedItem(feedItem);
  }

  return null;
};

export const mapFeedItemResponses = (
  items?: FeedItemResponse[]
): FeedItem[] => {
  if (!items || items.length === 0) {
    return [];
  }

  return items
    .map(mapFeedItemResponseToFeedItem)
    .filter((item): item is FeedItem => item !== null);
};

