import React, { useState, useEffect, useCallback } from "react";
import { View, Pressable, Dimensions, StyleSheet, Text } from "react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
import RightVideo from "./RightVideo";
import BottomVideo from "./BottomVideo";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import styles from "./styles";
import { Slider } from "react-native-elements";

const { height: screenHeight, width } = Dimensions.get("window");

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
  const [isPlaying, setIsPlaying] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSeeking, setIsSeeking] = useState(false);
  const [showSeekBar, setShowSeekBar] = useState(false);

  const player = useVideoPlayer(video.uri, (p) => {
    p.loop = true;
    p.muted = false;
  });

  const videoHeight = itemHeight - useBottomTabBarHeight();

  // Reset khi video đổi hoặc mất active
  useEffect(() => {
    if (!isActive) {
      player.pause();
      setIsPlaying(false);
      setIsBuffering(true);
    } else {
      player.play();
    }
  }, [isActive, video.uri, player]);


  return (
    <View style={[styles.container, { height: itemHeight }]}>
      <View style={[styles.videoContainer, { height: videoHeight }]}>
        <VideoView
          style={[styles.video, { height: videoHeight, width }]}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}

          contentFit="cover"
          nativeControls={true}
        />
      </View>

      {/* Nút bên phải */}
      <RightVideo
        id={video.id}
        likes={video.likes}
        comments={video.comments}
        shares={video.shares}
        outstanding={video.outstanding}
      />

      {/* Info dưới */}
      <BottomVideo title={video.title} />
    </View>
  );
}
