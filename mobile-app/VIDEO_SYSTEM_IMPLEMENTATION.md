# 🎬 TikTok-Like Video System - Complete Implementation Guide

## 📋 Overview

Hệ thống video tối ưu hoàn chỉnh cho TikTok Clone với tất cả tính năng advanced:

### ✨ Core Features
1. ✅ **AutoPlay/AutoPause** - Video tự động play khi visible
2. ✅ **View Tracking** - Tăng viewCount sau 3 giây xem
3. ✅ **Prefetch & Caching** - Tải trước video tiếp theo
4. ✅ **Infinite Scroll** - Cursor-based pagination
5. ✅ **WatchList Filter** - Không lặp lại video đã xem
6. ✅ **Memory Management** - Buffer tối đa 20 videos
7. ✅ **Real-time Interactions** - Like, comment, share
8. ✅ **Smooth Transitions** - 0.05-0.2s delay như TikTok

---

## 🏗️ Architecture

```
src/
├── Hooks/
│   ├── useVideoController.ts        ✅ CREATED - Core video logic
│   ├── useVideoFeed.ts              📝 TO CREATE - Feed management
│   └── useVideoInteractions.ts      📝 TO CREATE - Like/comment/share
├── Components/
│   ├── Video/
│   │   ├── OptimizedVideoPlayer.tsx  📝 TO CREATE - Player component
│   │   ├── VideoActions.tsx          📝 TO CREATE - Action buttons
│   │   └── VideoLoadingOverlay.tsx   📝 TO CREATE - Loading state
│   └── Feed/
│       └── InfiniteFeedList.tsx      📝 TO CREATE - Infinite scroll
└── Services/
    ├── VideoService.ts               ✅ EXISTS - Update needed
    ├── FeedService.ts                ✅ EXISTS - Update needed
    └── VideoCacheService.ts          📝 TO CREATE - Cache management
```

---

## 📦 Part 1: useVideoController (✅ CREATED)

**Location:** `src/Hooks/useVideoController.ts`

### Features:
- ✅ Auto play/pause based on visibility
- ✅ View tracking with 3s threshold
- ✅ App state handling (background/foreground)
- ✅ Memory cleanup
- ✅ Prefetch support (placeholder)

### Usage:
```typescript
const {
  player,
  isPlaying,
  currentTime,
  duration,
  hasRecordedView,
  play,
  pause,
  seek,
  cleanup,
} = useVideoController({
  videoUri: video.uri,
  feedItemId: video.id,
  isActive: isCurrentVideo,
  onViewRecorded: () => console.log('View recorded!'),
  viewThresholdSeconds: 3,
});
```

---

## 📦 Part 2: useVideoFeed Hook

**Purpose:** Manage infinite scroll feed with cursor-based pagination

### Key Features:
- Cursor-based pagination
- WatchList filtering
- Prefetch next page
- Buffer management (max 20 videos)
- Pull-to-refresh

### Implementation:

```typescript
// src/Hooks/useVideoFeed.ts
import { useState, useCallback, useRef, useEffect } from 'react';
import FeedService from '../Services/FeedService';
import { FeedItem } from '../Store/feedSlice';

interface UseVideoFeedConfig {
  pageSize?: number;
  maxBufferSize?: number;
  excludeWatched?: boolean;
}

interface UseVideoFeedReturn {
  feedItems: FeedItem[];
  loading: boolean;
  refreshing: boolean;
  hasMore: boolean;
  error: string | null;
  currentCursor: string | null;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  markAsWatched: (feedItemId: string) => void;
}

export function useVideoFeed({
  pageSize = 10,
  maxBufferSize = 20,
  excludeWatched = true,
}: UseVideoFeedConfig = {}): UseVideoFeedReturn {
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCursor, setCurrentCursor] = useState<string | null>(null);
  
  const watchedItemsRef = useRef<Set<string>>(new Set());
  const isLoadingRef = useRef(false);

  // Load initial feed
  const loadInitial = useCallback(async () => {
    if (isLoadingRef.current) return;
    
    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await FeedService.getFeedItems({
        cursor: null,
        limit: pageSize,
        excludeWatchList: excludeWatched,
      });

      setFeedItems(response.items);
      setCurrentCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load feed');
      console.error('[useVideoFeed] Load error:', err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [pageSize, excludeWatched]);

  // Load more (pagination)
  const loadMore = useCallback(async () => {
    if (isLoadingRef.current || !hasMore || !currentCursor) {
      return;
    }

    isLoadingRef.current = true;

    try {
      const response = await FeedService.getFeedItems({
        cursor: currentCursor,
        limit: pageSize,
        excludeWatchList: excludeWatched,
      });

      setFeedItems((prev) => {
        const newItems = [...prev, ...response.items];
        
        // Buffer management: keep only last maxBufferSize items
        if (newItems.length > maxBufferSize) {
          return newItems.slice(-maxBufferSize);
        }
        
        return newItems;
      });

      setCurrentCursor(response.nextCursor);
      setHasMore(response.hasMore);
    } catch (err) {
      console.error('[useVideoFeed] Load more error:', err);
    } finally {
      isLoadingRef.current = false;
    }
  }, [currentCursor, hasMore, pageSize, maxBufferSize, excludeWatched]);

  // Refresh feed
  const refresh = useCallback(async () => {
    setRefreshing(true);
    setCurrentCursor(null);
    setHasMore(true);
    watchedItemsRef.current.clear();

    try {
      const response = await FeedService.getFeedItems({
        cursor: null,
        limit: pageSize,
        excludeWatchList: excludeWatched,
      });

      setFeedItems(response.items);
      setCurrentCursor(response.nextCursor);
      setHasMore(response.hasMore);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh feed');
    } finally {
      setRefreshing(false);
    }
  }, [pageSize, excludeWatched]);

  // Mark video as watched
  const markAsWatched = useCallback((feedItemId: string) => {
    watchedItemsRef.current.add(feedItemId);
    console.log(`[useVideoFeed] Marked as watched: ${feedItemId}`);
  }, []);

  // Load initial feed on mount
  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return {
    feedItems,
    loading,
    refreshing,
    hasMore,
    error,
    currentCursor,
    loadMore,
    refresh,
    markAsWatched,
  };
}
```

---

## 📦 Part 3: useVideoInteractions Hook

**Purpose:** Handle like, comment, share, report actions

```typescript
// src/Hooks/useVideoInteractions.ts
import { useState, useCallback } from 'react';
import LoveService from '../Services/LoveService';
import FeedItemService from '../Services/FeedItemService';
import { Share } from 'react-native';

interface UseVideoInteractionsConfig {
  feedItemId: string;
  initialLiked?: boolean;
  initialLikeCount?: number;
  onLikeChange?: (liked: boolean, count: number) => void;
}

interface UseVideoInteractionsReturn {
  isLiked: boolean;
  likeCount: number;
  isLiking: boolean;
  toggleLike: () => Promise<void>;
  shareVideo: () => Promise<void>;
  reportVideo: (reason: string) => Promise<void>;
}

export function useVideoInteractions({
  feedItemId,
  initialLiked = false,
  initialLikeCount = 0,
  onLikeChange,
}: UseVideoInteractionsConfig): UseVideoInteractionsReturn {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiking, setIsLiking] = useState(false);

  // Toggle like/unlike
  const toggleLike = useCallback(async () => {
    if (isLiking) return;

    setIsLiking(true);
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      if (isLiked) {
        await LoveService.unlikeFeedItem(feedItemId);
      } else {
        await LoveService.loveFeedItem(feedItemId);
      }

      onLikeChange?.(!isLiked, isLiked ? likeCount - 1 : likeCount + 1);
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
      console.error('[useVideoInteractions] Like error:', error);
    } finally {
      setIsLiking(false);
    }
  }, [feedItemId, isLiked, likeCount, isLiking, onLikeChange]);

  // Share video
  const shareVideo = useCallback(async () => {
    try {
      const shareUrl = `https://app.example.com/video/${feedItemId}`;
      
      await Share.share({
        message: `Check out this video!`,
        url: shareUrl,
      });

      // Record share interaction
      await FeedItemService.recordShare(feedItemId);
    } catch (error) {
      console.error('[useVideoInteractions] Share error:', error);
    }
  }, [feedItemId]);

  // Report video
  const reportVideo = useCallback(async (reason: string) => {
    try {
      await FeedItemService.reportFeedItem(feedItemId, reason);
      console.log(`[useVideoInteractions] Video reported: ${reason}`);
    } catch (error) {
      console.error('[useVideoInteractions] Report error:', error);
      throw error;
    }
  }, [feedItemId]);

  return {
    isLiked,
    likeCount,
    isLiking,
    toggleLike,
    shareVideo,
    reportVideo,
  };
}
```

---

## 📦 Part 4: OptimizedVideoPlayer Component

```typescript
// src/Components/Video/OptimizedVideoPlayer.tsx
import React, { memo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { VideoView } from 'expo-video';
import { useVideoController } from '../../Hooks/useVideoController';
import VideoLoadingOverlay from './VideoLoadingOverlay';

interface OptimizedVideoPlayerProps {
  videoUri: string;
  feedItemId: string;
  isActive: boolean;
  onViewRecorded?: () => void;
  onPlayPausePress?: () => void;
}

const OptimizedVideoPlayer: React.FC<OptimizedVideoPlayerProps> = memo(({
  videoUri,
  feedItemId,
  isActive,
  onViewRecorded,
  onPlayPausePress,
}) => {
  const {
    player,
    isPlaying,
    hasRecordedView,
  } = useVideoController({
    videoUri,
    feedItemId,
    isActive,
    onViewRecorded,
    viewThresholdSeconds: 3,
  });

  return (
    <View style={styles.container}>
      <VideoView
        style={styles.video}
        player={player}
        contentFit="cover"
        nativeControls={false}
      />

      {/* Tap area for play/pause */}
      <Pressable
        style={styles.tapArea}
        onPress={onPlayPausePress}
      />

      {/* Loading overlay */}
      {!isPlaying && <VideoLoadingOverlay />}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  video: {
    flex: 1,
  },
  tapArea: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
});

export default OptimizedVideoPlayer;
```

---

## 📦 Part 5: Service Updates

### Update FeedService.ts

Add cursor-based pagination and watchList filtering:

```typescript
// Add to src/Services/FeedService.ts

interface GetFeedItemsParams {
  cursor: string | null;
  limit: number;
  excludeWatchList?: boolean;
}

interface GetFeedItemsResponse {
  items: FeedItem[];
  nextCursor: string | null;
  hasMore: boolean;
}

async getFeedItems(params: GetFeedItemsParams): Promise<GetFeedItemsResponse> {
  const queryParams = new URLSearchParams({
    limit: params.limit.toString(),
    ...(params.cursor && { cursor: params.cursor }),
    ...(params.excludeWatchList && { excludeWatchList: 'true' }),
  });

  const response = await httpClient.get(`/feed-items?${queryParams}`);
  return response.data.result;
}

async recordFeedItemView(feedItemId: string): Promise<void> {
  await httpClient.post(`/feed-items/${feedItemId}/view`);
}
```

---

## 🎯 Integration Steps

### Step 1: Update VerticalFeedList

Replace current implementation with:

```typescript
// src/Components/Feed/VerticalFeedList.tsx
import { useVideoFeed } from '../../Hooks/useVideoFeed';

export default function VerticalFeedList() {
  const {
    feedItems,
    loading,
    refreshing,
    hasMore,
    loadMore,
    refresh,
    markAsWatched,
  } = useVideoFeed({
    pageSize: 10,
    maxBufferSize: 20,
    excludeWatched: true,
  });

  const handleEndReached = useCallback(() => {
    if (hasMore && !loading) {
      loadMore();
    }
  }, [hasMore, loading, loadMore]);

  // ... rest of implementation
}
```

### Step 2: Update VideoCard

Replace with OptimizedVideoPlayer:

```typescript
// src/Components/Post/VideoCard.tsx
import OptimizedVideoPlayer from '../Video/OptimizedVideoPlayer';
import { useVideoInteractions } from '../../Hooks/useVideoInteractions';

const VideoCard: React.FC<VideoCardProps> = ({ video, isActive }) => {
  const {
    isLiked,
    likeCount,
    toggleLike,
    shareVideo,
  } = useVideoInteractions({
    feedItemId: video.id,
    initialLiked: video.loved,
    initialLikeCount: video.likes,
  });

  return (
    <View>
      <OptimizedVideoPlayer
        videoUri={video.uri}
        feedItemId={video.id}
        isActive={isActive}
        onViewRecorded={() => console.log('View recorded!')}
      />
      
      <VideoActions
        isLiked={isLiked}
        likeCount={likeCount}
        onLikePress={toggleLike}
        onSharePress={shareVideo}
      />
    </View>
  );
};
```

---

## 📊 Performance Optimizations

### 1. FlatList Configuration
```typescript
<FlatList
  data={feedItems}
  keyExtractor={(item, index) => `${item.id}_${index}`} // Prevent duplicate keys
  initialNumToRender={2}
  maxToRenderPerBatch={2}
  windowSize={3}
  removeClippedSubviews={true}
  updateCellsBatchingPeriod={50}
  onEndReached={handleEndReached}
  onEndReachedThreshold={0.5}
/>
```

### 2. Memory Management
- Buffer max 20 videos
- Clear old videos when scrolling
- Cleanup players on unmount

### 3. Prefetch Strategy
- Prefetch next 2 videos
- Use Image.prefetch for thumbnails
- Cache video metadata

---

## ✅ Checklist

- [x] useVideoController hook
- [ ] useVideoFeed hook
- [ ] useVideoInteractions hook
- [ ] OptimizedVideoPlayer component
- [ ] VideoActions component
- [ ] VideoLoadingOverlay component
- [ ] Update FeedService
- [ ] Update VerticalFeedList
- [ ] Update VideoCard
- [ ] Add cursor-based pagination to backend
- [ ] Add watchList filtering to backend
- [ ] Test infinite scroll
- [ ] Test view tracking
- [ ] Test memory management

---

## 🚀 Next Steps

1. Create remaining hooks (useVideoFeed, useVideoInteractions)
2. Create UI components (OptimizedVideoPlayer, VideoActions)
3. Update services (FeedService, VideoService)
4. Integrate into existing screens
5. Test performance
6. Optimize based on metrics

---

**Status:** Part 1 Complete (useVideoController ✅)
**Next:** Create useVideoFeed and useVideoInteractions hooks
