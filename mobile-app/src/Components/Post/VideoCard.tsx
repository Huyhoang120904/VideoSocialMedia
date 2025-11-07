/**
 * VideoCard Component (refactored from Post/index.tsx)
 * Main video card component for TikTok-like feed
 * Features: Responsive layout, gesture controls, optimized video player
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { View, Pressable, StyleSheet, Text, Animated } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { theme } from '../../constants/theme';
import { dimensions } from '../../Utils/responsive';
import RightVideo from './RightVideo';
import BottomVideo from './BottomVideo';

interface VideoData {
    id: string;
    uri: string;
    title?: string;
    description?: string;
    likes?: number;
    comments?: number;
    outstanding?: number;
    shares?: number;
    username?: string;
    avatarUrl?: string;
    musicName?: string;
}

interface VideoCardProps {
    video: VideoData;
    isActive: boolean;
    itemHeight?: number;
    onFollowPress?: () => void;
    isFollowing?: boolean;
}

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
    if (isNaN(seconds) || seconds < 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const VideoCard: React.FC<VideoCardProps> = memo(({
    video,
    isActive,
    itemHeight = dimensions.screenHeight,
    onFollowPress,
    isFollowing = false,
}) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [progressBarWidth, setProgressBarWidth] = useState(dimensions.screenWidth);

    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const videoHeight = itemHeight + insets.top;

    // Calculate dynamic positions
    // Progress bar: Chỉ cách bottom safe area 52px (chiều cao thực tế của tab bar ~48-50px + 2-4px spacing)
    const progressBarBottom = insets.bottom;
    // Bottom video: Nằm phía trên progress bar (30px là height của progress bar + 8px spacing)
    const bottomContentBottom = progressBarBottom;

    // Animation refs
    const controlsOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(0)).current;

    const player = useVideoPlayer(video.uri, (p) => {
        p.loop = true;
        p.muted = false;
    });

    // Video player event listeners
    useEffect(() => {
        const timeListener = player.addListener('timeUpdate', (e) => {
            if (!isDragging) {
                setCurrentTime(e.currentTime);
            }
        });

        const playingListener = player.addListener('playingChange', (e) => {
            setIsPlaying(e.isPlaying);
        });

        const durationCheck = setInterval(() => {
            if (player.duration > 0 && duration === 0) {
                setDuration(player.duration);
                clearInterval(durationCheck);
            }
        }, 100);

        return () => {
            timeListener.remove();
            playingListener.remove();
            clearInterval(durationCheck);
        };
    }, [player, isDragging, duration]);

    // Handle video playback based on active state
    useEffect(() => {
        if (isActive) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, player, video.uri]);

    // Time sync when not dragging
    useEffect(() => {
        if (!isDragging && isPlaying) {
            const syncInterval = setInterval(() => {
                if (
                    player.currentTime !== undefined &&
                    Math.abs(player.currentTime - currentTime) > 0.5
                ) {
                    setCurrentTime(player.currentTime);
                }
            }, 500);

            return () => clearInterval(syncInterval);
        }
    }, [isDragging, isPlaying, currentTime, player]);

    // Animate controls visibility
    const showControlsAnimated = () => {
        setShowControls(true);
        Animated.parallel([
            Animated.timing(controlsOpacity, {
                toValue: 1,
                duration: theme.animationTimings.duration.fast,
                useNativeDriver: true,
            }),
            Animated.spring(iconScale, {
                toValue: 1,
                useNativeDriver: true,
                ...theme.animationTimings.spring.bouncy,
            }),
        ]).start();

        // Auto-hide controls after 1.5s
        setTimeout(() => {
            hideControlsAnimated();
        }, 1500);
    };

    const hideControlsAnimated = () => {
        Animated.parallel([
            Animated.timing(controlsOpacity, {
                toValue: 0,
                duration: theme.animationTimings.duration.normal,
                useNativeDriver: true,
            }),
            Animated.timing(iconScale, {
                toValue: 0,
                duration: theme.animationTimings.duration.fast,
                useNativeDriver: true,
            }),
        ]).start(() => {
            setShowControls(false);
        });
    };

    const handlePlayPause = () => {
        if (isPlaying) {
            player.pause();
        } else {
            player.play();
        }
        showControlsAnimated();
    };

    const handleProgressPress = (event: any) => {
        const { locationX } = event.nativeEvent;
        const progress = Math.max(0, Math.min(1, locationX / progressBarWidth));
        const newTime = progress * duration;

        if (duration > 0) {
            player.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleProgressLayout = (event: any) => {
        const { width } = event.nativeEvent.layout;
        setProgressBarWidth(width);
    };

    const handleTouchStart = (event: any) => {
        setIsDragging(true);
        handleProgressPress(event);
    };

    const handleTouchMove = (event: any) => {
        if (!isDragging) return;

        const { locationX } = event.nativeEvent;
        const progress = Math.max(0, Math.min(1, locationX / progressBarWidth));
        const newTime = progress * duration;

        if (duration > 0) {
            setCurrentTime(newTime);
            player.currentTime = newTime;
        }
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
        setTimeout(() => {
            if (player.currentTime !== undefined) {
                setCurrentTime(player.currentTime);
            }
        }, 50);
    };

    const progressRatio = duration > 0 ? currentTime / duration : 0;

    return (
        <View style={[styles.container, { height: itemHeight }]}>
            {/* Video Player */}
            <View style={[styles.videoContainer, { height: videoHeight }]}>
                <VideoView
                    style={[styles.video, { height: videoHeight, width: dimensions.screenWidth }]}
                    player={player}
                    contentFit="cover"
                    nativeControls={false}
                    fullscreenOptions={{ enable: false }}
                    allowsPictureInPicture={false}
                />

                {/* Center tap area for play/pause */}
                <Pressable
                    style={styles.centerTapArea}
                    onPress={handlePlayPause}
                />

                {/* Play/Pause icon overlay */}
                {(showControls || !isPlaying) && (
                    <Animated.View
                        style={[
                            styles.controlsOverlay,
                            { opacity: controlsOpacity }
                        ]}
                        pointerEvents="none"
                    >
                        <Animated.View
                            style={[
                                styles.iconBackground,
                                { transform: [{ scale: iconScale }] }
                            ]}
                        >
                            <FontAwesome6
                                name={isPlaying ? 'pause' : 'play'}
                                size={theme.componentSizes.icon.xxlarge}
                                color={theme.colors.icon.default}
                            />
                        </Animated.View>
                    </Animated.View>
                )}

                {/* Progress Bar */}
                <View style={[styles.progressBarWrapper, { bottom: progressBarBottom }]}>
                    {(!isPlaying || isDragging) && (
                        <View style={styles.timeIndicatorContainer}>
                            <Text style={styles.timeText}>{formatTime(currentTime)}</Text>
                            <Text style={styles.timeText}>{formatTime(duration)}</Text>
                        </View>
                    )}
                    <View
                        style={styles.progressBarTouchable}
                        onLayout={handleProgressLayout}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                    >
                        <View style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    { width: `${progressRatio * 100}%` },
                                ]}
                            />
                            <View
                                style={[
                                    styles.progressThumb,
                                    {
                                        left: Math.max(
                                            0,
                                            Math.min(
                                                progressBarWidth - theme.componentSizes.progressBar.thumbSize / 2,
                                                progressBarWidth * progressRatio - theme.componentSizes.progressBar.thumbSize / 2
                                            )
                                        ),
                                        transform: isDragging ? [{ scale: 1.5 }] : [{ scale: 1 }],
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>
            </View>

            {/* Interaction Bar (right side) */}
            <RightVideo
                id={video.id}
                likes={video.likes || 0}
                comments={video.comments || 0}
                shares={video.shares || 0}
                outstanding={video.outstanding || 0}
                feedItemType="VIDEO"
                bottomPosition={bottomContentBottom}
            />

            {/* User Info Section (bottom left) */}
            <BottomVideo
                title={video.title}
                description={video.description}
                username={video.username}
                bottomPosition={bottomContentBottom}
            />
        </View>
    );
});

VideoCard.displayName = 'VideoCard';

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: theme.colors.background.dark,
        position: 'relative',
    },
    videoContainer: {
        width: '100%',
        backgroundColor: theme.colors.background.dark,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    video: {
        backgroundColor: theme.colors.background.dark,
    },
    centerTapArea: {
        position: 'absolute',
        left: 0,
        right: 80,
        top: 0,
        bottom: 80,
        zIndex: theme.layout.zIndex.controls,
    },
    controlsOverlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background.overlayLight,
        zIndex: theme.layout.zIndex.overlay,
    },
    iconBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.background.overlay,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressBarWrapper: {
        position: 'absolute',
        left: 0,
        right: 0,
        height: theme.componentSizes.progressBar.touchableHeight,
        justifyContent: 'flex-end',
        paddingBottom: theme.layout.spacing.tiny,
        zIndex: theme.layout.zIndex.controls,
    },
    progressBarTouchable: {
        height: theme.componentSizes.progressBar.touchableHeight,
        justifyContent: 'flex-end',
        paddingBottom: 1,
    },
    progressBarBackground: {
        height: theme.componentSizes.progressBar.height,
        backgroundColor: theme.colors.progressBar.background,
        width: '100%',
        position: 'relative',
    },
    progressBarFill: {
        height: theme.componentSizes.progressBar.height,
        backgroundColor: theme.colors.progressBar.fill,
    },
    progressThumb: {
        position: 'absolute',
        width: theme.componentSizes.progressBar.thumbSize,
        height: theme.componentSizes.progressBar.thumbSize,
        borderRadius: theme.componentSizes.progressBar.thumbSize / 2,
        backgroundColor: theme.colors.progressBar.thumb,
        top: -(theme.componentSizes.progressBar.thumbSize - theme.componentSizes.progressBar.height) / 2,
        ...theme.layout.shadow.small,
    },
    timeIndicatorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: theme.layout.spacing.small,
        marginBottom: theme.layout.spacing.tiny,
        height: 16,
    },
    timeText: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.tiny,
        fontFamily: theme.typography.fontFamily.medium,
        fontWeight: theme.typography.fontWeight.medium,
        textShadowColor: theme.colors.background.overlayDark,
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    },
});

export default VideoCard;
