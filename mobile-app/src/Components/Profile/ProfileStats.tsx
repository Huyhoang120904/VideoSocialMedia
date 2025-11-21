import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { formatNumber } from "../../Utils/NumberHelper";

interface ProfileStatsProps {
  followingCount: number;
  followerCount: number;
  feedItemCount: number;
  onFollowingPress?: () => void;
  onFollowersPress?: () => void;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({
  followingCount,
  followerCount,
  feedItemCount,
  onFollowingPress,
  onFollowersPress,
}) => {
  return (
    <View className="flex-row justify-center items-center mb-6 w-full">
      <TouchableOpacity
        className="items-center flex-1"
        onPress={onFollowingPress}
        activeOpacity={0.7}
        disabled={!onFollowingPress}
      >
        <Text className="text-gray-900 text-lg font-bold">
          {formatNumber(followingCount)}
        </Text>
        <Text className="text-gray-600 text-sm">Following</Text>
      </TouchableOpacity>

      <TouchableOpacity
        className="items-center flex-1"
        onPress={onFollowersPress}
        activeOpacity={0.7}
        disabled={!onFollowersPress}
      >
        <Text className="text-gray-900 text-lg font-bold">
          {formatNumber(followerCount)}
        </Text>
        <Text className="text-gray-600 text-sm">Followers</Text>
      </TouchableOpacity>

      <View className="items-center flex-1">
        <Text className="text-gray-900 text-lg font-bold">
          {formatNumber(feedItemCount)}
        </Text>
        <Text className="text-gray-600 text-sm">Posts</Text>
      </View>
    </View>
  );
};

