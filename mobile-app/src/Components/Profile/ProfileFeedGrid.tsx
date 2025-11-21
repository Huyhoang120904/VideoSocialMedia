import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { VideoItem } from "../../Services/FeedItemService";
import { ProfileFeedItem } from "./ProfileFeedItem";

interface ProfileFeedGridProps {
  feedItems: VideoItem[];
  isLoading: boolean;
  onFeedItemPress: (feedItemId: string) => void;
}

export const ProfileFeedGrid: React.FC<ProfileFeedGridProps> = ({
  feedItems,
  isLoading,
  onFeedItemPress,
}) => {
  if (isLoading) {
    return (
      <View className="items-center justify-center py-20">
        <ActivityIndicator size="large" color="#ff0050" />
        <Text className="text-gray-700 mt-4">Loading posts...</Text>
      </View>
    );
  }

  if (feedItems.length === 0) {
    return (
      <View className="items-center justify-center py-20">
        <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mb-4">
          <Text className="text-gray-600 text-2xl">📹</Text>
        </View>
        <Text className="text-gray-600 text-lg mb-2">No posts yet</Text>
        <Text className="text-gray-500 text-sm text-center">
          When you post videos or images, they'll appear here
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 px-2 py-2">
      <FlatList
        data={feedItems}
        numColumns={3}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <ProfileFeedItem
            item={item}
            onPress={() => onFeedItemPress(item.id)}
          />
        )}
      />
    </View>
  );
};

