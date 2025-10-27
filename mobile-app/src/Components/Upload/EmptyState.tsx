import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UploadType } from "../../../Types/request";

interface EmptyStateProps {
  type: UploadType;
  onSelect: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, onSelect }) => {
  const isVideo = type === "video";

  return (
    <View className="flex-1 justify-center items-center px-8 py-15">
      <View className="w-30 h-30 rounded-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 justify-center items-center mb-6 border border-white/10">
        <Ionicons
          name={isVideo ? "videocam-outline" : "images-outline"}
          size={80}
          color="#666"
        />
      </View>
      <Text
        className="text-2xl font-semibold text-white mb-2 text-center"
        style={{ fontFamily: "TikTokSans-SemiBold" }}
      >
        {isVideo ? "No Video Selected" : "No Images Selected"}
      </Text>
      <Text
        className="text-base text-gray-400 text-center mb-8 leading-5 px-2"
        style={{ fontFamily: "TikTokSans-Regular" }}
      >
        {isVideo
          ? "Choose a video from your gallery to get started"
          : "Choose images from your gallery to create a slide"}
      </Text>

      <TouchableOpacity
        className="flex-row items-center bg-gradient-to-r from-pink-500 to-pink-600 px-8 py-4 rounded-full mb-10 shadow-lg"
        onPress={onSelect}
      >
        <Ionicons name="folder-open-outline" size={24} color="#fff" />
        <Text
          className="text-white text-base font-semibold ml-2"
          style={{ fontFamily: "TikTokSans-SemiBold" }}
        >
          {isVideo ? "Select Video" : "Select Images"}
        </Text>
      </TouchableOpacity>

      <View className="bg-white/5 p-5 rounded-xl w-full border border-white/10">
        <Text
          className="text-base font-semibold text-white mb-3"
          style={{ fontFamily: "TikTokSans-SemiBold" }}
        >
          {isVideo ? "Video Requirements:" : "Image Requirements:"}
        </Text>
        {isVideo ? (
          <>
            <Text
              className="text-sm text-gray-300 mb-1.5"
              style={{ fontFamily: "TikTokSans-Regular" }}
            >
              • Maximum duration: 60 seconds
            </Text>
            <Text
              className="text-sm text-gray-300 mb-1.5"
              style={{ fontFamily: "TikTokSans-Regular" }}
            >
              • Supported formats: MP4, MOV
            </Text>
            <Text
              className="text-sm text-gray-300"
              style={{ fontFamily: "TikTokSans-Regular" }}
            >
              • Maximum file size: 100MB
            </Text>
          </>
        ) : (
          <>
            <Text
              className="text-sm text-gray-300 mb-1.5"
              style={{ fontFamily: "TikTokSans-Regular" }}
            >
              • Select multiple images (slideshow)
            </Text>
            <Text
              className="text-sm text-gray-300 mb-1.5"
              style={{ fontFamily: "TikTokSans-Regular" }}
            >
              • Supported formats: JPG, PNG
            </Text>
            <Text
              className="text-sm text-gray-300"
              style={{ fontFamily: "TikTokSans-Regular" }}
            >
              • Maximum file size: 10MB per image
            </Text>
          </>
        )}
      </View>
    </View>
  );
};
