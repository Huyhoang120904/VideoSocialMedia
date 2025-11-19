import React, { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { VideoData } from "../../../Types/request";

interface VideoPreviewProps {
  video: VideoData;
  onRemove: () => void;
  videoRef: React.RefObject<Video | null>;
  height: number;
}

export const VideoPreview: React.FC<VideoPreviewProps> = ({
  video,
  onRemove,
  videoRef,
  height,
}) => {
  // Ensure audio is enabled when video loads
  useEffect(() => {
    const setupAudio = async () => {
      if (videoRef.current) {
        try {
          await videoRef.current.setIsMutedAsync(false);
          await videoRef.current.setVolumeAsync(1.0);
        } catch (error) {
          console.error("Error setting video audio:", error);
        }
      }
    };

    // Set audio after a short delay to ensure video is loaded
    const timer = setTimeout(setupAudio, 500);
    return () => clearTimeout(timer);
  }, [video.uri, videoRef]);

  return (
    <View
      className="rounded-xl overflow-hidden bg-gray-900 relative shadow-xl border border-white/10"
      style={{ marginHorizontal: 16, marginBottom: 16 }}
    >
      <Video
        ref={videoRef}
        source={{ uri: video.uri }}
        style={{ width: "100%", height: height * 0.4 }}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
        shouldPlay={false}
        isMuted={false}
        volume={1.0}
      />
      <TouchableOpacity
        className="absolute top-3 right-3 bg-black/70 rounded-full p-1 shadow-lg"
        onPress={onRemove}
      >
        <Ionicons name="close-circle" size={28} color="#ff4444" />
      </TouchableOpacity>
    </View>
  );
};
