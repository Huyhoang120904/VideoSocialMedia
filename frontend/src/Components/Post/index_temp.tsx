import React, { useState, useEffect, useRef } from "react";
import { View, Pressable, Dimensions, Text, StyleSheet } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { FontAwesome6 } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";

const { width: screenWidth } = Dimensions.get("window");

interface VideoPlayerProps {
    uri: string;
    isActive: boolean;
    videoHeight: number;
}

export default function VideoPlayer({ uri, isActive, videoHeight }: VideoPlayerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showPauseIcon, setShowPauseIcon] = useState(false);

    const player = useVideoPlayer(uri, (p) => {
        p.loop = true;
        p.muted = false;
    });

    // Listeners
    useEffect(() => {
        const playingListener = player.addListener("playingChange", (e) => {
            setIsPlaying(e.isPlaying);
        });

        const timeListener = player.addListener("timeUpdate", (e) => {
            setCurrentTime(e.currentTime);
            if (player.duration > 0) {
                setDuration(player.duration);
            }
        });

        return () => {
            playingListener.remove();
            timeListener.remove();
        };
    }, [player]);

    // Control active state
    useEffect(() => {
        if (isActive) {
            player.play();
        } else {
            player.pause();
        }
    }, [isActive, player]);

    // Toggle play/pause
    const handlePlayPause = () => {
        if (player.playing) {
            player.pause();
        } else {
            player.play();
        }
        setShowPauseIcon(true);
        setTimeout(() => setShowPauseIcon(false), 800);
    };

    // Seek to position
    const handleProgressPress = (event: any) => {
        const { locationX } = event.nativeEvent;
        const progress = locationX / screenWidth;
        const newTime = progress * duration;
        player.currentTime = newTime;
    };

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return (
        <View style={{ height: videoHeight }}>
            <VideoView
                style={{ width: screenWidth, height: videoHeight }}
                player={player}
                contentFit="cover"
                nativeControls={false}
            />

            {/* Tap to pause/play */}
            <Pressable
                style={StyleSheet.absoluteFillObject}
                onPress={handlePlayPause}
            />

            {/* Pause icon */}
            {showPauseIcon && !player.playing && (
                <View style={styles.pauseIconContainer}>
                    <FontAwesome6 name="play" size={60} color="rgba(255,255,255,0.9)" />
                </View>
            )}

            {/* TikTok-style thin progress bar */}
            <View style={styles.progressBarContainer}>
                <Pressable
                    style={styles.progressBarTouchable}
                    onPress={handleProgressPress}
                >
                    <View style={styles.progressBarBackground}>
                        <View
                            style={[
                                styles.progressBarFill,
                                { width: `${progress}%` },
                            ]}
                        />
                    </View>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    pauseIconContainer: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0,0,0,0.3)",
    },
    progressBarContainer: {
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 40,
        justifyContent: "flex-end",
        paddingBottom: 2,
    },
    progressBarTouchable: {
        height: 40,
        justifyContent: "flex-end",
        paddingBottom: 2,
    },
    progressBarBackground: {
        height: 2,
        backgroundColor: "rgba(255,255,255,0.3)",
        width: "100%",
    },
    progressBarFill: {
        height: 2,
        backgroundColor: "#fff",
    },
});
