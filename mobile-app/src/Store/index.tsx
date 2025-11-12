import { configureStore } from '@reduxjs/toolkit';
import videoReducer from './videoSlice';
import feedReducer from './feedSlice';

export const store = configureStore({
    reducer: {
        videos: videoReducer,
        feed: feedReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;