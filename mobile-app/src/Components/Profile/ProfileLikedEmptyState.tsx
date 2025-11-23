import React from "react";
import { View, Text } from "react-native";

interface ProfileLikedEmptyStateProps {
  title?: string;
  description?: string;
}

export const ProfileLikedEmptyState: React.FC<ProfileLikedEmptyStateProps> = ({
  title = "No liked videos",
  description = "Videos you like will appear here",
}) => {
  return (
    <View className="flex-1 px-4 py-6">
      <View className="items-center justify-center py-20">
        <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mb-4">
          <Text className="text-gray-600 text-2xl">❤️</Text>
        </View>
        <Text className="text-gray-600 text-lg mb-2">{title}</Text>
        <Text className="text-gray-500 text-sm text-center">{description}</Text>
      </View>
    </View>
  );
};

