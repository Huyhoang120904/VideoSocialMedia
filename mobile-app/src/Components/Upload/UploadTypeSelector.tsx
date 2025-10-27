import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UploadType } from "../../../Types/request";

interface UploadTypeSelectorProps {
  uploadType: UploadType;
  onTypeChange: (type: UploadType) => void;
}

export const UploadTypeSelector: React.FC<UploadTypeSelectorProps> = ({
  uploadType,
  onTypeChange,
}) => {
  return (
    <View className="flex-row px-4 py-3 gap-2 border-b border-white/10">
      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border-2 ${
          uploadType === "video"
            ? "bg-pink-500/20 border-pink-500"
            : "bg-white/5 border-transparent"
        }`}
        onPress={() => onTypeChange("video")}
      >
        <Ionicons
          name="videocam"
          size={24}
          color={uploadType === "video" ? "#fff" : "#666"}
        />
        <Text
          className={`text-base font-semibold ml-2 ${uploadType === "video" ? "text-white" : "text-gray-500"}`}
          style={{ fontFamily: "TikTokSans-SemiBold" }}
        >
          Video
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`flex-1 flex-row items-center justify-center py-3 px-4 rounded-lg border-2 ${
          uploadType === "imageSlide"
            ? "bg-pink-500/20 border-pink-500"
            : "bg-white/5 border-transparent"
        }`}
        onPress={() => onTypeChange("imageSlide")}
      >
        <Ionicons
          name="images"
          size={24}
          color={uploadType === "imageSlide" ? "#fff" : "#666"}
        />
        <Text
          className={`text-base font-semibold ml-2 ${uploadType === "imageSlide" ? "text-white" : "text-gray-500"}`}
          style={{ fontFamily: "TikTokSans-SemiBold" }}
        >
          Image Slide
        </Text>
      </TouchableOpacity>
    </View>
  );
};
