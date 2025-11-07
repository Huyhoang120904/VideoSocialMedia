import { createSlice } from "@reduxjs/toolkit";
import { FeedItemType } from "../Types/response/FeedItemResponse";

export interface ImageData {
    id: string;
    url: string;
    secureUrl?: string;
    thumbnailUrl?: string;
    width?: number;
    height?: number;
}

export interface ImageSlideData {
    id: string;
    images: ImageData[];
}

export interface FeedItem {
    id: string;
    feedItemType: FeedItemType;
    // For VIDEO type
    video?: {
        id: string;
        fileName: string;
        size: number;
        url: string;
        secureUrl?: string;
        format: string;
        resourceType: string;
        title?: string;
        description?: string;
        thumbnailUrl?: string;
        uri: string; // Computed from url/secureUrl for video player
    };
    // For IMAGE_SLIDE type
    imageSlide?: ImageSlideData;
    // Common fields
    likes: number;
    comments: number;
    shares: number;
    outstanding?: number;
    title?: string;
    description?: string;
    hashtags?: string[]; // Add hashtags
}

interface FeedState {
    feedItems: FeedItem[];
}

const initialState: FeedState = {
    feedItems: [],
};

const feedSlice = createSlice({
    name: "feed",
    initialState,
    reducers: {
        setFeedItems(state, action) {
            state.feedItems = action.payload;
        },
        updateFeedItem(state, action) {
            const { id, updates } = action.payload;
            state.feedItems = state.feedItems.map((item) =>
                item.id === id ? { ...item, ...updates } : item
            );
        },
        addFeedItem(state, action) {
            // Thêm feed item mới vào đầu danh sách
            state.feedItems = [action.payload, ...state.feedItems];
        },
        clearFeedItems(state) {
            state.feedItems = [];
        },
    },
});

export const { setFeedItems, updateFeedItem, addFeedItem, clearFeedItems } =
    feedSlice.actions;
export default feedSlice.reducer;
