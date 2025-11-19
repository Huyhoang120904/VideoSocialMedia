/**
 * VideoCard Component (refactored from Post/index.tsx)
 * Main video card component for TikTok-like feed
 * Features: Responsive layout, gesture controls, optimized video player
 */

import React, { useState, useEffect, useRef, memo } from 'react';
import { View, Pressable, StyleSheet, Text, Animated } from 'react-native';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Audio } from 'expo-av';
import { FontAwesome6 } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { theme } from '../../constants/theme';
import { dimensions } from '../../Utils/responsive';
import RightVideo from './RightVideo';
import BottomVideo from './BottomVideo';
import VideoCommentModal from '../Comment/VideoCommentModal';
import VideoOptionsModal from './VideoOptionsModal';
import UserInteractionService from '../../Services/UserInteractionService';
import UserDetailService from '../../Services/UserDetailService';
import { useAuth } from '../../Context/AuthProvider';

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
    uploaderUserId?: string; // UserDetail ID của người upload
    musicName?: string;
    hashtags?: string[];
    loved?: boolean; // Trạng thái đã yêu thích
}

interface VideoCardProps {
    video: VideoData;
    isActive: boolean;
    itemHeight?: number;
    onFollowPress?: () => void;
    isFollowing?: boolean;
    isCommentModalOpen?: boolean; // Trạng thái modal comment
    onCommentModalChange?: (isOpen: boolean) => void; // Callback khi modal thay đổi
    onOptionsModalChange?: (isOpen: boolean) => void; // Callback khi options modal thay đổi
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
    isCommentModalOpen = false,
    onCommentModalChange,
    onOptionsModalChange,
}) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [showControls, setShowControls] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const [progressBarWidth, setProgressBarWidth] = useState(dimensions.screenWidth);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [currentComments, setCurrentComments] = useState(video.comments || 0);

    // Watch time tracking
    const watchStartTime = useRef<number | null>(null);
    const accumulatedWatchTime = useRef<number>(0);
    const userDetailIdRef = useRef<string | null>(null);
    const { isAuthenticated } = useAuth();

    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    // Remove adding top safe-area to video height — it was increasing the
    // total item height and effectively pushing BottomVideo/RightVideo up.
    const videoHeight = itemHeight;

    // Calculate dynamic positions for progress bar (nằm vừa trên tab bar)
    // Progress bar bao gồm: timeIndicatorContainer (~20px) + progressBarTouchable (30px) + padding
    // Tổng chiều cao progress bar: ~50-55px
    const progressBarTotalHeight = 55; // Approximate total height của progress bar
    const spacingAboveTabBar = -101; // Khoảng cách nhỏ giữa progress bar và tab bar
    const visualTabIconsHeight = Math.max(tabBarHeight - insets.bottom, 0);
    // Progress bar nằm ngay phía trên tab bar
    const progressBarBottom = visualTabIconsHeight + insets.bottom + spacingAboveTabBar;

    // Animation refs
    const controlsOpacity = useRef(new Animated.Value(0)).current;
    const iconScale = useRef(new Animated.Value(0)).current;

    const player = useVideoPlayer(video.uri, (p) => {
        p.loop = true;
        p.muted = false;
        p.volume = 1.0;
    });

    // Set audio mode when component mounts
    useEffect(() => {
        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    playsInSilentModeIOS: true,
                    allowsRecordingIOS: false,
                    staysActiveInBackground: false,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: false,
                    interruptionModeIOS: 1, // DoNotMix
                    interruptionModeAndroid: 1, // DoNotMix
                });
            } catch (error) {
                console.error("Error setting audio mode:", error);
            }
        };

        setupAudio();
    }, []);

    // Ensure audio is unmuted and volume is set when player is ready
    useEffect(() => {
        if (player) {
            player.muted = false;
            player.volume = 1.0;
        }
    }, [player, video.uri]);

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

    // Load userDetailId when component mounts
    useEffect(() => {
        if (isAuthenticated && !userDetailIdRef.current) {
            UserDetailService.getMyDetails()
                .then((response) => {
                    if (response.result?.id) {
                        userDetailIdRef.current = response.result.id;
                    }
                })
                .catch((error) => {
                    console.error('Error loading user detail ID:', error);
                });
        }
    }, [isAuthenticated]);

    // Handle video playback based on active state
    useEffect(() => {
        if (isActive) {
            // Ensure audio is enabled when video becomes active
            player.muted = false;
            player.volume = 1.0;
            player.play();
            // Start tracking watch time
            watchStartTime.current = Date.now();
        } else {
            player.pause();
            // Save watch time when video becomes inactive
            if (watchStartTime.current !== null) {
                const watchDuration = (Date.now() - watchStartTime.current) / 1000; // Convert to seconds
                accumulatedWatchTime.current += watchDuration;
                watchStartTime.current = null;

                // Send UserInteraction to backend
                if (userDetailIdRef.current && accumulatedWatchTime.current > 0) {
                    UserInteractionService.saveInteraction({
                        feedItemId: video.id,
                        userDetailId: userDetailIdRef.current,
                        watchDuration: accumulatedWatchTime.current,
                    })
                        .then(() => {
                            console.log('✅ UserInteraction saved:', {
                                feedItemId: video.id,
                                watchDuration: accumulatedWatchTime.current,
                            });
                            // Reset accumulated time after saving
                            accumulatedWatchTime.current = 0;
                        })
                        .catch((error) => {
                            console.error('❌ Error saving UserInteraction:', error);
                        });
                }
            }
        }
    }, [isActive, player, video.uri, video.id]);

    // Reset watch time when video changes
    useEffect(() => {
        watchStartTime.current = null;
        accumulatedWatchTime.current = 0;
    }, [video.id]);

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

    // Notify parent when comment modal changes
    useEffect(() => {
        if (onCommentModalChange) {
            onCommentModalChange(commentModalVisible);
        }
    }, [commentModalVisible, onCommentModalChange]);

    // Notify parent when options modal changes
    useEffect(() => {
        if (onOptionsModalChange) {
            onOptionsModalChange(optionsModalVisible);
        }
    }, [optionsModalVisible, onOptionsModalChange]);

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

    // Comment modal handlers
    const handleOpenComments = () => {
        setCommentModalVisible(true);
    };

    const handleCloseComments = () => {
        setCommentModalVisible(false);
    };

    const handleAddComment = (comment: string) => {
        console.log('New comment:', comment);
    };

    const handleUpdateCommentCount = (newCount: number) => {
        setCurrentComments(newCount);
    };

    const progressRatio = duration > 0 ? currentTime / duration : 0;

    // Tính toán height của video khi comment modal hoặc options modal mở
    // Khi modal mở, video cần chiếm ~50% màn hình và nằm ở vị trí top: 0 (absolute)
    const isAnyModalOpen = commentModalVisible || optionsModalVisible;
    const videoContainerHeight = isAnyModalOpen ? dimensions.screenHeight * 0.50 : videoHeight;

    return (
        <View style={[styles.container, { height: itemHeight }]}>
            {/* Video Player */}
            <View style={[
                styles.videoContainer,
                {
                    height: videoContainerHeight,
                    justifyContent: 'center',
                    alignItems: 'center',
                },
                // Khi modal mở, video nằm absolute ở top để không có khoảng đen
                isAnyModalOpen && {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    zIndex: 1,
                }
            ]}>
                <VideoView
                    style={[
                        styles.video,
                        {
                            height: videoContainerHeight,
                            width: dimensions.screenWidth
                        }
                    ]}
                    player={player}
                    contentFit={isAnyModalOpen ? "contain" : "cover"}
                    nativeControls={false}
                    fullscreenOptions={{ enable: false }}
                    allowsPictureInPicture={false}
                />

                {/* Center tap area for play/pause */}
                <Pressable
                    style={styles.centerTapArea}
                    onPress={handlePlayPause}
                    onLongPress={() => {
                        setOptionsModalVisible(true);
                    }}
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

                {/* Progress Bar - chỉ hiển thị khi tap vào video, nằm dưới searchBarContainer */}
                {!isAnyModalOpen && showControls && (
                    <Animated.View
                        style={[
                            styles.progressBarWrapper,
                            {
                                bottom: progressBarBottom,
                                opacity: controlsOpacity
                            }
                        ]}
                    >
                        {/* Chỉ hiển thị time indicator khi đang tua (isDragging) */}
                        {isDragging && (
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
                    </Animated.View>
                )}
            </View>

            {/* Interaction Bar (right side) */}
            {!isAnyModalOpen && (
                <RightVideo
                    id={video.id}
                    likes={video.likes || 0}
                    comments={currentComments}
                    shares={video.shares || 0}
                    outstanding={video.outstanding || 0}
                    isLoved={video.loved || false}
                    avatarUrl={video.avatarUrl}
                    uploaderUserId={video.uploaderUserId}
                    onCommentPress={handleOpenComments}
                />
            )}

            {/* User Info Section (bottom left) */}
            {!isAnyModalOpen && (
                <BottomVideo
                    title={video.title}
                    description={video.description}
                    username={video.username}
                    hashtags={video.hashtags}
                />
            )}

            {/* Comment Modal - render outside to prevent hiding */}
            <VideoCommentModal
                visible={commentModalVisible}
                onClose={handleCloseComments}
                videoId={video.id}
                onAddComment={handleAddComment}
                onUpdateCommentCount={handleUpdateCommentCount}
            />

            {/* Video Options Modal */}
            <VideoOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                feedItemId={video.id} // ✅ Truyền feedItemId
                videoId={video.id} // Video ID (có thể lấy từ video object nếu có)
                onDownload={() => {
                    console.log('Download video');
                }}
                onNotInterested={() => {
                    console.log('Not interested');
                }}
                onSpeedChange={(speed) => {
                    console.log('Speed changed to:', speed);
                    player.playbackRate = speed;
                }}
                onSimplifiedScreen={() => {
                    console.log('Simplified screen');
                }}
                onSubtitles={() => {
                    console.log('Subtitles');
                }}
                onPictureInPicture={() => {
                    console.log('Picture in picture');
                }}
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
        width: '100%', // Đảm bảo full width
        paddingHorizontal: 0, // Bỏ padding để full width
        paddingBottom: theme.layout.spacing.small,
        paddingTop: theme.layout.spacing.tiny * 0.4,
        zIndex: 110, // Cao hơn searchBarContainer (101) để hiển thị trên cùng
    },
    progressBarTouchable: {
        height: theme.componentSizes.progressBar.touchableHeight,
        justifyContent: 'flex-end',
        paddingBottom: 0,
    },
    progressBarBackground: {
        height: theme.componentSizes.progressBar.height,
        backgroundColor: theme.colors.progressBar.background,
        width: '100%',
        position: 'relative',
        marginHorizontal: 0, // Đảm bảo full width
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
        alignItems: 'center',
        marginBottom: theme.layout.spacing.tiny * 0.6,
        paddingHorizontal: theme.layout.spacing.small, // Padding cho time text
    },
    timeText: {
        color: '#fff',
        fontSize: theme.typography.fontSize.small,
        fontFamily: theme.typography.fontFamily.medium,
        fontWeight: theme.typography.fontWeight.medium,
        textShadowColor: 'rgba(0,0,0,0.6)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 3,
    },
});

export default VideoCard;
