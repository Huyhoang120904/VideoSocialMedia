import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ProfileTabsProps {
  activeTab: "posts" | "liked";
  onTabChange: (tab: "posts" | "liked") => void;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  return (
    <View className="border-t border-gray-300">
      <View className="flex-row">
        <TouchableOpacity
          className={`flex-1 py-4 border-b-2 ${
            activeTab === "posts" ? "border-gray-900" : "border-transparent"
          }`}
          onPress={() => onTabChange("posts")}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "posts" ? "text-gray-900" : "text-gray-600"
            }`}
          >
            Posts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 border-b-2 ${
            activeTab === "liked" ? "border-gray-900" : "border-transparent"
          }`}
          onPress={() => onTabChange("liked")}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "liked" ? "text-gray-900" : "text-gray-600"
            }`}
          >
            Liked
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

