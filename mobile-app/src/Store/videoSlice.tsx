import { createSlice } from "@reduxjs/toolkit";

export interface Video {
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
  // Frontend-specific fields for UI state
  uri: string; // Computed from url/secureUrl for video player
  likes?: number; // Default to 0, can be updated from other APIs
  comments?: number; // Default to 0, can be updated from other APIs
  shares?: number; // Default to 0, can be updated from other APIs
  outstanding?: number; // Default to 0, can be updated from other APIs
}

interface VideoState {
  videos: Video[];
}

const initialState: VideoState = {
  videos: [],
};

const videoSlice = createSlice({
  name: "videos",
  initialState,
  reducers: {
    setVideos(state, action) {
      state.videos = action.payload;
    },
    updateVideo(state, action) {
      const { id, updates } = action.payload;
      state.videos = state.videos.map((video) =>
        video.id === id ? { ...video, ...updates } : video
      );
    },
    addVideo(state, action) {
      // Thêm video mới vào đầu danh sách
      state.videos = [action.payload, ...state.videos];
    },
    clearVideos(state) {
      state.videos = [];
    },
  },
});

export const { setVideos, updateVideo, addVideo, clearVideos } =
  videoSlice.actions;
export default videoSlice.reducer;
