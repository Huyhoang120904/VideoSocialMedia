import { createSlice } from '@reduxjs/toolkit';

export interface Video {
    id: string;
    uri: string;
    title: string;
    likes: number;
    comments: number;
    shares: number;
    outstanding: number;
}

interface VideoState {
    videos: Video[];
}

const initialState: VideoState = {
    videos: [],
};

const videoSlice = createSlice({
    name: 'videos',
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
    },
});

export const { setVideos, updateVideo } = videoSlice.actions;
export default videoSlice.reducer;