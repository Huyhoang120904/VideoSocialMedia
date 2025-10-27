import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface UploadHeaderProps {
  onBack?: () => void;
}

export const UploadHeader: React.FC<UploadHeaderProps> = ({ onBack }) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-white/10">
      <TouchableOpacity className="p-2" onPress={onBack}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <Text
        className="text-lg font-semibold text-white"
        style={{ fontFamily: "TikTokSans-SemiBold" }}
      >
        Upload Content
      </Text>
      <View className="w-10" />
    </View>
  );
};
