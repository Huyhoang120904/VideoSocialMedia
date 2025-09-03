import React, { useRef, useState, useEffect, useCallback } from "react";
import {
    View,
    Pressable,
    Dimensions,
    Animated,
    PanResponder,
    Text,
    LayoutChangeEvent,
} from "react-native";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import RightVideo from "./RightVideo";
import BottomVideo from "./BottomVideo";
import TopVideo from "./TopVideo";
import { useHeaderHeight } from "@react-navigation/elements";
import styles from "./styles";

const { height, width } = Dimensions.get("screen");

interface VideoData {
    id: string;
    uri: string;
    title: string;
    likes: number;
    comments: number;
    outstanding: number;
    shares: number;
}

interface PostProps {
    video: VideoData;
    isActive: boolean;
}

export default function Post({ video, isActive }: PostProps) {
    const headerHeight = useHeaderHeight();
    const videoRef = useRef<Video | null>(null);

    const progressAnim = useRef(new Animated.Value(0)).current;
    const hideProgressTimeout = useRef<NodeJS.Timeout | null>(null);

    const currentPositionRef = useRef(0);
    const videoDurationRef = useRef(0);
    const progressBarWidthRef = useRef(0);

    const [isPlaying, setIsPlaying] = useState(false);
    const [videoDuration, setVideoDuration] = useState(0);
    const [videoPosition, setVideoPosition] = useState(0);
    const [isScrubbing, setIsScrubbing] = useState(false);
    const [wasPlayingBeforeScrub, setWasPlayingBeforeScrub] = useState(false);
    const [showProgress, setShowProgress] = useState(false);

    const initialTouchXRef = useRef<number | null>(null);
    const movedRef = useRef(false);

    const videoHeight = height - headerHeight;

    const formatTime = useCallback((milliseconds: number) => {
        const totalSeconds = Math.max(0, Math.floor(milliseconds / 1000));
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    }, []);

    const showProgressBar = useCallback(() => {
        setShowProgress(true);
        if (hideProgressTimeout.current) {
            clearTimeout(hideProgressTimeout.current);
            hideProgressTimeout.current = null;
        }
        hideProgressTimeout.current = setTimeout(() => {
            if (!isScrubbing) setShowProgress(false);
        }, 3000);
    }, [isScrubbing]);

    const onPlaybackStatusUpdate = useCallback(
        (status: AVPlaybackStatus) => {
            // @ts-ignore
            if (!status?.isLoaded) return;

            // @ts-ignore
            if (typeof status.durationMillis === "number") {
                videoDurationRef.current = status.durationMillis;
                setVideoDuration(status.durationMillis);
            }

            // chỉ update khi KHÔNG scrub
            if (!isScrubbing && typeof status.positionMillis === "number") {
                currentPositionRef.current = status.positionMillis;
                setVideoPosition(status.positionMillis);

                if (videoDurationRef.current && progressBarWidthRef.current) {
                    const p =
                        (status.positionMillis / videoDurationRef.current) *
                        progressBarWidthRef.current;
                    progressAnim.setValue(p);
                }
            }

            // @ts-ignore
            setIsPlaying(Boolean(status.isPlaying));

            // @ts-ignore
            if (status.didJustFinish) {
                progressAnim.setValue(0);
                currentPositionRef.current = 0;
                setVideoPosition(0);
                setIsPlaying(false);
            }
        },
        [isScrubbing, progressAnim]
    );

    const progressPanResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,

            onPanResponderGrant: async (evt) => {
                setWasPlayingBeforeScrub(isPlaying);
                setIsScrubbing(true);
                showProgressBar();

                initialTouchXRef.current = evt.nativeEvent.locationX;
                movedRef.current = false;

                if (isPlaying) {
                    await videoRef.current?.pauseAsync();
                }

                if (hideProgressTimeout.current) {
                    clearTimeout(hideProgressTimeout.current);
                    hideProgressTimeout.current = null;
                }

                const touchX = evt.nativeEvent.locationX;
                const widthPx = progressBarWidthRef.current || 0;
                const clampedX = Math.max(0, Math.min(touchX, widthPx));
                progressAnim.setValue(clampedX);

                const newPos =
                    widthPx > 0 && videoDurationRef.current
                        ? (clampedX / widthPx) * videoDurationRef.current
                        : 0;

                currentPositionRef.current = newPos;
                setVideoPosition(newPos);
            },

            onPanResponderMove: (evt) => {
                if (videoDurationRef.current <= 0 || progressBarWidthRef.current <= 0)
                    return;

                const touchX = evt.nativeEvent.locationX;
                if (
                    initialTouchXRef.current !== null &&
                    Math.abs(touchX - initialTouchXRef.current) > 5
                ) {
                    movedRef.current = true;
                }

                const widthPx = progressBarWidthRef.current;
                const clampedX = Math.max(0, Math.min(touchX, widthPx));
                const newPos = (clampedX / widthPx) * videoDurationRef.current;

                progressAnim.setValue(clampedX);
                currentPositionRef.current = newPos;
                setVideoPosition(newPos);
            },

            onPanResponderRelease: async () => {
                try {
                    const seekTo = currentPositionRef.current || 0;
                    await videoRef.current?.setPositionAsync(Math.max(0, seekTo));

                    if (!movedRef.current && wasPlayingBeforeScrub && isActive) {
                        await videoRef.current?.playAsync();
                    }
                } catch (e) {
                    console.log("seek error on release", e);
                }

                setIsScrubbing(false);

                if (movedRef.current && wasPlayingBeforeScrub && isActive) {
                    try {
                        await videoRef.current?.playAsync();
                    } catch (e) {
                        console.log("resume play error", e);
                    }
                }

                hideProgressTimeout.current = setTimeout(() => {
                    setShowProgress(false);
                }, 3000);
            },

            onPanResponderTerminate: async () => {
                try {
                    const seekTo = currentPositionRef.current || 0;
                    await videoRef.current?.setPositionAsync(Math.max(0, seekTo));
                } catch (e) {
                    console.log("seek error on terminate", e);
                }

                setIsScrubbing(false);
                if (wasPlayingBeforeScrub && isActive) {
                    await videoRef.current?.playAsync();
                }
            },
        })
    ).current;

    const playVideo = useCallback(async () => {
        try {
            await videoRef.current?.playAsync();
            setIsPlaying(true);
        } catch (error) {
            console.log("Error playing video:", error);
        }
    }, []);

    const pauseVideo = useCallback(async () => {
        try {
            await videoRef.current?.pauseAsync();
            setIsPlaying(false);
        } catch (error) {
            console.log("Error pausing video:", error);
        }
    }, []);

    const stopAndResetVideo = useCallback(async () => {
        try {
            await videoRef.current?.stopAsync();
            await videoRef.current?.setPositionAsync(0);
            setIsPlaying(false);
            progressAnim.setValue(0);
            currentPositionRef.current = 0;
            setVideoPosition(0);
        } catch (error) {
            console.log("Error stopping video:", error);
        }
    }, [progressAnim]);

    const handleTogglePlay = useCallback(async () => {
        if (isScrubbing) return;
        showProgressBar();
        if (isPlaying) {
            await pauseVideo();
        } else {
            await playVideo();
        }
    }, [isScrubbing, isPlaying, showProgressBar, pauseVideo, playVideo]);

    useEffect(() => {
        progressAnim.setValue(0);
        currentPositionRef.current = 0;
        setVideoPosition(0);
        setVideoDuration(0);
        setShowProgress(false);
        setIsScrubbing(false);
        videoDurationRef.current = 0;
    }, [video.uri, progressAnim]);

    useEffect(() => {
        if (isActive) {
            playVideo();
        } else {
            stopAndResetVideo();
        }
    }, [isActive, playVideo, stopAndResetVideo]);

    useEffect(() => {
        return () => {
            if (hideProgressTimeout.current) {
                clearTimeout(hideProgressTimeout.current);
            }
        };
    }, []);

    const onProgressBarLayout = (event: LayoutChangeEvent) => {
        const { width } = event.nativeEvent.layout;
        progressBarWidthRef.current = width;
    };

    return (
        <View style={[styles.container, { height: videoHeight }]}>
            <TopVideo />
            <Video
                ref={(ref) => (videoRef.current = ref)}
                style={[styles.video, { height: videoHeight }]}
                source={{ uri: video.uri }}
                shouldPlay={isActive && isPlaying && !isScrubbing}
                isLooping={true}
                resizeMode={ResizeMode.CONTAIN}
                isMuted={false}
                onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                onError={(error) => {
                    console.log("Video loading error:", error);
                }}
            />

            {showProgress && (videoDurationRef.current || videoDuration > 0) && (
                <View style={[styles.progressContainer, { bottom: headerHeight + 120 }]}>
                    <View style={styles.timeContainer}>
                        <Text style={styles.timeText}>
                            {formatTime(videoPosition)} /{" "}
                            {formatTime(videoDurationRef.current || videoDuration)}
                        </Text>
                    </View>

                    <View
                        style={styles.progressTouchArea}
                        onLayout={onProgressBarLayout}
                        {...progressPanResponder.panHandlers}
                    >
                        <View style={styles.progressTrack}>
                            <View style={styles.progressBackground} />
                            <Animated.View
                                style={[
                                    styles.progressForeground,
                                    { width: progressAnim },
                                ]}
                            />
                            <Animated.View
                                style={[
                                    styles.progressThumb,
                                    {
                                        left: Animated.subtract(progressAnim, 7),
                                        transform: [{ scale: isScrubbing ? 1.4 : 1 }],
                                        opacity: isScrubbing ? 1 : 0.9,
                                    },
                                ]}
                            />
                        </View>
                    </View>
                </View>
            )}

            <Pressable
                style={[styles.touchArea, showProgress && { bottom: 100 }]}
                onPress={handleTogglePlay}
            >
                {!isPlaying && !isScrubbing && (
                    <View style={styles.overlay}>
                        <FontAwesome6 name="play" size={60} color="#fff" />
                    </View>
                )}
            </Pressable>

            <RightVideo
                id={video.id}
                likes={video.likes}
                comments={video.comments}
                shares={video.shares}
                outstanding={video.outstanding}
            />
            <BottomVideo title={video.title} />
        </View>
    );
}
