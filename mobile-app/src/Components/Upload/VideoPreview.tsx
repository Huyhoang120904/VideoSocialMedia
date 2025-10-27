import React from "react";
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
  return (
    <View className="m-4 rounded-xl overflow-hidden bg-gray-900 relative shadow-xl border border-white/10">
      <Video
        ref={videoRef}
        source={{ uri: video.uri }}
        style={{ width: "100%", height: height * 0.4 }}
        useNativeControls
        resizeMode={ResizeMode.COVER}
        isLooping
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
