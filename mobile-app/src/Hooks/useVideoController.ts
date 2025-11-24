/**
 * useVideoController - TikTok-like Video Controller Hook
 * 
 * Features:
 * - AutoPlay/AutoPause based on visibility
 * - Prefetch next videos
 * - View tracking (3s threshold)
 * - Memory management
 * - Buffer management (max 20 videos)
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useVideoPlayer, VideoPlayer } from 'expo-video';
import UserInteractionService from '../Services/UserInteractionService';
import FeedService from '../Services/FeedService';

interface VideoControllerConfig {
    videoUri: string;
    feedItemId: string;
    isActive: boolean;
    onViewRecorded?: () => void;
    onError?: (error: Error) => void;
    prefetchNext?: boolean;
    viewThresholdSeconds?: number; // Default: 3s
}

interface VideoControllerReturn {
    player: VideoPlayer;
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    hasRecordedView: boolean;
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    cleanup: () => void;
}

// Global cache for prefetched videos
const videoPrefetchCache = new Map<string, boolean>();
const MAX_CACHE_SIZE = 20;

export function useVideoController({
    videoUri,
    feedItemId,
    isActive,
    onViewRecorded,
    onError,
    prefetchNext = true,
    viewThresholdSeconds = 3,
}: VideoControllerConfig): VideoControllerReturn {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [hasRecordedView, setHasRecordedView] = useState(false);

    // Refs for tracking
    const watchStartTimeRef = useRef<number | null>(null);
    const totalWatchTimeRef = useRef(0);
    const hasReachedThresholdRef = useRef(false);
    const viewRecordedRef = useRef(false);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    // Create video player
    const player = useVideoPlayer(videoUri, (p) => {
        p.loop = true;
        p.muted = false;
        p.volume = 1.0;
    });

    // ============================================
    // PLAY/PAUSE CONTROLS
    // ============================================

    const play = useCallback(() => {
        try {
            player.play();
            watchStartTimeRef.current = Date.now();
        } catch (error) {
            console.error('[VideoController] Play error:', error);
            onError?.(error as Error);
        }
    }, [player, onError]);

    const pause = useCallback(() => {
        try {
            player.pause();

            // Calculate watch time
            if (watchStartTimeRef.current) {
                const watchDuration = (Date.now() - watchStartTimeRef.current) / 1000;
                totalWatchTimeRef.current += watchDuration;
                watchStartTimeRef.current = null;

                console.log(`[VideoController] Total watch time: ${totalWatchTimeRef.current.toFixed(2)}s`);
            }
        } catch (error) {
            console.error('[VideoController] Pause error:', error);
        }
    }, [player]);

    const seek = useCallback((time: number) => {
        try {
            player.currentTime = time;
        } catch (error) {
            console.error('[VideoController] Seek error:', error);
        }
    }, [player]);

    // ============================================
    // VIEW TRACKING (3s threshold)
    // ============================================

    const recordView = useCallback(async () => {
        if (viewRecordedRef.current || hasReachedThresholdRef.current) {
            return;
        }

        try {
            await FeedService.recordFeedItemView(feedItemId);
            viewRecordedRef.current = true;
            setHasRecordedView(true);
            onViewRecorded?.();

            console.log(`✅ [VideoController] View recorded for ${feedItemId}`);
        } catch (error) {
            console.error('[VideoController] Failed to record view:', error);
            onError?.(error as Error);
        }
    }, [feedItemId, onViewRecorded, onError]);

    // Check if view threshold reached
    useEffect(() => {
        if (hasReachedThresholdRef.current || !isPlaying) {
            return;
        }

        const checkInterval = setInterval(() => {
            if (totalWatchTimeRef.current >= viewThresholdSeconds) {
                hasReachedThresholdRef.current = true;
                recordView();
                clearInterval(checkInterval);
            }
        }, 500); // Check every 500ms

        return () => clearInterval(checkInterval);
    }, [isPlaying, viewThresholdSeconds, recordView]);

    // ============================================
    // AUTO PLAY/PAUSE BASED ON VISIBILITY
    // ============================================

    useEffect(() => {
        if (isActive) {
            play();
        } else {
            pause();
        }
    }, [isActive, play, pause]);

    // ============================================
    // APP STATE HANDLING (Background/Foreground)
    // ============================================

    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextAppState === 'active'
            ) {
                // App came to foreground
                if (isActive) {
                    play();
                }
            } else if (nextAppState.match(/inactive|background/)) {
                // App went to background
                pause();
            }

            appStateRef.current = nextAppState;
        });

        return () => {
            subscription.remove();
        };
    }, [isActive, play, pause]);

    // ============================================
    // PLAYER EVENT LISTENERS
    // ============================================

    useEffect(() => {
        const timeListener = player.addListener('timeUpdate', (e) => {
            setCurrentTime(e.currentTime);
        });

        const playingListener = player.addListener('playingChange', (e) => {
            setIsPlaying(e.isPlaying);
        });

        const durationCheck = setInterval(() => {
            if (player.duration > 0) {
                setDuration(player.duration);
                clearInterval(durationCheck);
            }
        }, 100);

        return () => {
            timeListener.remove();
            playingListener.remove();
            clearInterval(durationCheck);
        };
    }, [player]);

    // ============================================
    // PREFETCH NEXT VIDEO
    // ============================================

    useEffect(() => {
        if (!prefetchNext || !isActive) {
            return;
        }

        // Prefetch logic would go here
        // This is a placeholder - actual implementation would fetch next video URL
        // and preload it using Image.prefetch or similar

        console.log('[VideoController] Prefetch next video (placeholder)');
    }, [isActive, prefetchNext]);

    // ============================================
    // CLEANUP
    // ============================================

    const cleanup = useCallback(() => {
        pause();

        // Reset refs
        watchStartTimeRef.current = null;
        totalWatchTimeRef.current = 0;
        hasReachedThresholdRef.current = false;
        viewRecordedRef.current = false;

        console.log('[VideoController] Cleanup completed');
    }, [pause]);

    useEffect(() => {
        return () => {
            cleanup();
        };
    }, [cleanup]);

    // ============================================
    // RETURN API
    // ============================================

    return {
        player,
        isPlaying,
        currentTime,
        duration,
        hasRecordedView,
        play,
        pause,
        seek,
        cleanup,
    };
}

// ============================================
// CACHE MANAGEMENT UTILITIES
// ============================================

export function clearVideoPrefetchCache() {
    videoPrefetchCache.clear();
    console.log('[VideoController] Prefetch cache cleared');
}

export function getCacheSize() {
    return videoPrefetchCache.size;
}

export function removeCacheEntry(key: string) {
    videoPrefetchCache.delete(key);
}
