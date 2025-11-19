import React from "react";
import { FeedItem } from "../../Store/feedSlice";
import { FeedItemType } from "../../Types/response/FeedItemResponse";
import VideoCard from "./VideoCard";
import ImageSlidePost from "./ImageSlidePost";

interface FeedPostProps {
  feedItem: FeedItem;
  isActive: boolean;
  itemHeight?: number;
  onCommentModalChange?: (isOpen: boolean) => void;
  onOptionsModalChange?: (isOpen: boolean) => void;
  onImageSlideChange?: (currentIndex: number, totalImages: number) => void;
}

export default function FeedPost({
  feedItem,
  isActive,
  itemHeight,
  onCommentModalChange,
  onOptionsModalChange,
  onImageSlideChange,
}: FeedPostProps) {
  if (feedItem.feedItemType === FeedItemType.VIDEO && feedItem.video) {
    // Render video post
    return (
      <VideoCard
        video={{
          id: feedItem.id, // ✅ Đây là FeedItem ID - ĐÚNG
          uri: feedItem.video.uri,
          duration: feedItem.video.duration,
          title: feedItem.title,
          description: feedItem.description,
          likes: feedItem.likes,
          comments: feedItem.comments,
          shares: feedItem.shares,
          outstanding: feedItem.outstanding,
          username:
            feedItem.uploader?.displayName ||
            feedItem.uploader?.shownName ||
            feedItem.uploader?.user?.username ||
            "user1",
          avatarUrl:
            feedItem.uploader?.avatar?.secureUrl ||
            feedItem.uploader?.avatar?.url,
          uploaderUserId: feedItem.uploader?.id, // Truyền UserDetail ID
          musicName: undefined,
          hashtags: feedItem.hashtags,
          loved: feedItem.loved, // Truyền trạng thái loved
        }}
        isActive={isActive}
        itemHeight={itemHeight}
        onCommentModalChange={onCommentModalChange}
        onOptionsModalChange={onOptionsModalChange}
      />
    );
  }

  if (
    feedItem.feedItemType === FeedItemType.IMAGE_SLIDE &&
    feedItem.imageSlide
  ) {
    // Render image slide post
    return (
      <ImageSlidePost
        feedItemId={feedItem.id} // ✅ Truyền FeedItem ID
        imageSlide={feedItem.imageSlide} // ImageSlide data chứa images
        likes={feedItem.likes}
        comments={feedItem.comments}
        shares={feedItem.shares}
        outstanding={feedItem.outstanding}
        title={feedItem.title}
        description={feedItem.description}
        isActive={isActive}
        itemHeight={itemHeight}
        hashtags={feedItem.hashtags}
        loved={feedItem.loved} // Truyền trạng thái loved
        username={
          feedItem.uploader?.displayName ||
          feedItem.uploader?.shownName ||
          feedItem.uploader?.user?.username ||
          "user1"
        }
        avatarUrl={
          feedItem.uploader?.avatar?.secureUrl || feedItem.uploader?.avatar?.url
        }
        uploaderUserId={feedItem.uploader?.id} // Truyền UserDetail ID
        onImageSlideChange={onImageSlideChange}
      />
    );
  }

  // Fallback - should not happen
  console.warn("FeedPost: Unknown feed item type or missing data", feedItem);
  return null;
}
