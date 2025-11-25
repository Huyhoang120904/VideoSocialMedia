import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { VideoItem } from "../../Services/FeedItemService";
import { ProfileFeedItem, PROFILE_ITEM_GAP } from "./ProfileFeedItem";

interface ProfileFeedGridProps {
  feedItems: VideoItem[];
  isLoading: boolean;
  onFeedItemPress: (feedItem: VideoItem) => void;
  emptyTitle?: string;
  emptyDescription?: string;
}

export const ProfileFeedGrid: React.FC<ProfileFeedGridProps> = ({
  feedItems,
  isLoading,
  onFeedItemPress,
  emptyTitle,
  emptyDescription,
}) => {
  const noPostsTitle = emptyTitle ?? "No posts yet";
  const noPostsDescription =
    emptyDescription ?? "When you post videos or images, they'll appear here";

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
        <Text className="text-gray-600 text-lg mb-2">{noPostsTitle}</Text>
        <Text className="text-gray-500 text-sm text-center">
          {noPostsDescription}
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <FlatList
        data={feedItems}
        numColumns={3}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        columnWrapperStyle={{ width: "100%" }}
        contentContainerStyle={{
          paddingHorizontal: PROFILE_ITEM_GAP,
        }}
        renderItem={({ item, index }) => {
          const isEndOfRow = (index + 1) % 3 === 0;
          const itemStyle = {
            marginRight: isEndOfRow ? 0 : PROFILE_ITEM_GAP,
            marginBottom: PROFILE_ITEM_GAP,
          };
          return (
            <ProfileFeedItem
              item={item}
              onPress={() => onFeedItemPress(item)}
              style={itemStyle}
            />
          );
        }}
      />
    </View>
  );
};
