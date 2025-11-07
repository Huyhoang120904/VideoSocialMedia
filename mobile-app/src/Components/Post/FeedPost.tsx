import React from "react";
import { FeedItem } from "../../Store/feedSlice";
import { FeedItemType } from "../../Types/response/FeedItemResponse";
import VideoCard from "./VideoCard";
import ImageSlidePost from "./ImageSlidePost";

interface FeedPostProps {
    feedItem: FeedItem;
    isActive: boolean;
    itemHeight?: number;
}

export default function FeedPost({
    feedItem,
    isActive,
    itemHeight,
}: FeedPostProps) {
    // Debug logging
    console.log('FeedPost rendering:', {
        id: feedItem.id,
        type: feedItem.feedItemType,
        hasVideo: !!feedItem.video,
        hasImageSlide: !!feedItem.imageSlide,
        imageCount: feedItem.imageSlide?.images?.length || 0
    });

    if (feedItem.feedItemType === FeedItemType.VIDEO && feedItem.video) {
        // Render video post
        return (
            <VideoCard
                video={{
                    id: feedItem.id,
                    uri: feedItem.video.uri,
                    title: feedItem.title,
                    description: feedItem.description,
                    likes: feedItem.likes,
                    comments: feedItem.comments,
                    shares: feedItem.shares,
                    outstanding: feedItem.outstanding,
                    username: 'user1', // TODO: Add user info to FeedItem type
                    avatarUrl: undefined,
                    musicName: undefined,
                }}
                isActive={isActive}
                itemHeight={itemHeight}
            />
        );
    }

    if (
        feedItem.feedItemType === FeedItemType.IMAGE_SLIDE &&
        feedItem.imageSlide
    ) {
        // Render image slide post
        console.log('Rendering ImageSlidePost with', feedItem.imageSlide.images.length, 'images');
        return (
            <ImageSlidePost
                imageSlide={feedItem.imageSlide}
                likes={feedItem.likes}
                comments={feedItem.comments}
                shares={feedItem.shares}
                outstanding={feedItem.outstanding}
                title={feedItem.title}
                description={feedItem.description}
                isActive={isActive}
                itemHeight={itemHeight}
                hashtags={feedItem.hashtags}
            />
        );
    }

    // Fallback - should not happen
    console.warn('FeedPost: Unknown feed item type or missing data', feedItem);
    return null;
}
