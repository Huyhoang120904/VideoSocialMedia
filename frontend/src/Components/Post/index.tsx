import React, { useState, useEffect } from "react";
import { View, Pressable, Dimensions, StyleSheet, Text } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { FontAwesome6 } from "@expo/vector-icons";
import RightVideo from "./RightVideo";
import BottomVideo from "./BottomVideo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "./styles";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");
const { height: windowHeight } = Dimensions.get("window");

// Format seconds to MM:SS
const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || seconds < 0) return "00:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

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
  itemHeight?: number;
}

export default function Post({ video, isActive, itemHeight = screenHeight }: PostProps) {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showPauseIcon, setShowPauseIcon] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progressBarWidth, setProgressBarWidth] = useState(screenWidth);

  const bottomTabHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  // Use full screen height for video, accounting for status bar and navigation
  const videoHeight = itemHeight || windowHeight + insets.top; // Add status bar height for TikTok-like appearance

  const player = useVideoPlayer(video.uri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  useEffect(() => {
    const timeListener = player.addListener("timeUpdate", (e) => {
      // Always update currentTime when not dragging
      if (!isDragging) {
        setCurrentTime(e.currentTime);
      }
    });

    const playingListener = player.addListener("playingChange", (e) => {
      setIsPlaying(e.isPlaying);
    });

    // Check for duration periodically
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

  useEffect(() => {
    if (isActive) {
      player.play();
    } else {
      player.pause();
    }
  }, [isActive, player, video.uri]);

  // Additional effect to ensure time sync when not dragging
  useEffect(() => {
    if (!isDragging && isPlaying) {
      const syncInterval = setInterval(() => {
        if (player.currentTime !== undefined && Math.abs(player.currentTime - currentTime) > 0.5) {
          setCurrentTime(player.currentTime);
        }
      }, 500);

      return () => clearInterval(syncInterval);
    }
  }, [isDragging, isPlaying, currentTime, player]);

  const handlePlayPause = () => {
    if (isPlaying) {
      player.pause();
    } else {
      player.play();
    }
    // Show icon feedback for longer duration
    setShowPauseIcon(true);
    setTimeout(() => setShowPauseIcon(false), 1200); // Increased to 1.2s
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
    // Force sync currentTime with player after drag ends
    setTimeout(() => {
      if (player.currentTime !== undefined) {
        setCurrentTime(player.currentTime);
      }
    }, 50);
  };



  const progressRatio = duration > 0 ? currentTime / duration : 0;

  return (
    <View style={[styles.container, { height: itemHeight }]}>
      <View style={[styles.videoContainer, { height: videoHeight }]}>
        <VideoView
          style={[styles.video, { height: videoHeight, width: screenWidth }]}
          player={player}
          contentFit="cover"
          nativeControls={false}
          fullscreenOptions={{ enable: false }}
          allowsPictureInPicture={false}
        />

        {/* Center tap area for play/pause */}
        <Pressable
          style={[StyleSheet.absoluteFillObject, localStyles.centerTapArea]}
          onPress={handlePlayPause}
        />

        {/* Play/Pause icon display - only show when paused or feedback */}
        {(!isPlaying || showPauseIcon) && (
          <View style={localStyles.pauseIconContainer} pointerEvents="none">
            <View style={localStyles.iconBackground}>
              <FontAwesome6
                name={!isPlaying ? "play" : "pause"}
                size={50}
                color="rgba(255,255,255,0.98)"
              />
            </View>
          </View>
        )}

        {/* Progress bar and time indicators */}
        <View style={localStyles.progressBarWrapper}>
          {/* Show time only when paused or dragging */}
          {(!isPlaying || isDragging) && (
            <View style={localStyles.timeIndicatorContainer}>
              <Text style={localStyles.timeText}>
                {formatTime(currentTime)}
              </Text>
              <Text style={localStyles.timeText}>
                {formatTime(duration)}
              </Text>
            </View>
          )}
          <View
            style={localStyles.progressBarTouchable}
            onLayout={handleProgressLayout}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onTouchCancel={handleTouchEnd}
          >
            <View style={localStyles.progressBarBackground}>
              <View
                style={[
                  localStyles.progressBarFill,
                  { width: progressBarWidth * progressRatio },
                ]}
              />
              {/* Progress thumb */}
              <View
                style={[
                  localStyles.progressThumb,
                  {
                    left: Math.max(0, Math.min(progressBarWidth - 8, (progressBarWidth * progressRatio) - 4)),
                    transform: isDragging ? [{ scale: 1.5 }] : [{ scale: 1 }]
                  }
                ]}
              />
            </View>
          </View>
        </View>
      </View>

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

const localStyles = StyleSheet.create({
  pauseIconContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
    zIndex: 5, // Lower than centerTapArea
  },

  iconBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  progressBarWrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 30, // Reduced height
    justifyContent: "flex-end",
    paddingBottom: 2,
    zIndex: 50, // Higher than all other elements
  },
  progressBarTouchable: {
    height: 30,
    justifyContent: "flex-end",
    paddingBottom: 1,
    paddingHorizontal: 0, // Remove any padding that affects width
  },
  progressBarBackground: {
    height: 3, // Slightly thicker for better visibility
    backgroundColor: "rgba(255,255,255,0.4)", // More visible background
    width: "100%",
    position: "relative",
  },
  progressBarFill: {
    height: 3, // Match background height
    backgroundColor: "#fff", // Pure white for better visibility
  },
  timeIndicatorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    marginBottom: 4,
    height: 16, // Fixed height to prevent layout jumping
  },
  timeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500",
    textShadowColor: 'rgba(0, 0, 0, 0.7)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  centerTapArea: {
    left: 0,
    right: 80, // Leave space for right side buttons (80px from right)
    top: 0,
    bottom: 60, // Increased to avoid progress bar
    zIndex: 20, // Higher than pause icon
  },

  progressThumb: {
    position: "absolute",
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "white",
    top: -2.75,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
});