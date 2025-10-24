import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface UserItemData {
  id: string;
  displayName: string;
  username?: string;
  bio?: string;
  avatar?: { url: string };
  isOnline?: boolean;
}

interface UserItemProps {
  user: UserItemData;
  onPress: (user: UserItemData) => void;
  onViewProfile?: (user: UserItemData) => void;
  showProfileButton?: boolean;
}

const UserItem: React.FC<UserItemProps> = ({
  user,
  onPress,
  onViewProfile,
  showProfileButton = false,
}) => {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      onPress={() => onPress(user)}
      activeOpacity={0.7}
    >
      <View className="relative">
        {user.avatar?.url ? (
          <Image
            source={{ uri: user.avatar.url }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 rounded-full bg-gray-300 items-center justify-center">
            <Ionicons name="person" size={24} color="#9CA3AF" />
          </View>
        )}
        {user.isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-semibold text-base text-gray-800">
          {user.displayName}
        </Text>
        <Text className="text-sm text-gray-500">
          {user.bio || user.username || "No bio available"}
        </Text>
      </View>

      <View className="flex-row items-center">
        {user.isOnline && (
          <View className="flex-row items-center mr-2">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <Text className="text-xs text-green-500">Online</Text>
          </View>
        )}
        {showProfileButton && onViewProfile && (
          <TouchableOpacity
            onPress={(e) => {
              e.stopPropagation();
              onViewProfile(user);
            }}
            className="mr-2 p-2 bg-gray-100 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons
              name="information-circle-outline"
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        )}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );
};

export default UserItem;
