import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Animated } from "react-native";

interface ConversationHeaderProps {
  conversationName: string;
  avatar?: any;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onBackPress: () => void;
  onSearchPress: () => void;
  onOptionsPress: () => void;
}

export default function ConversationHeader({
  conversationName,
  avatar,
  fadeAnim,
  slideAnim,
  onBackPress,
  onSearchPress,
  onOptionsPress,
}: ConversationHeaderProps) {
  return (
    <Animated.View
      className="px-4 py-3 bg-white/80 backdrop-blur-sm border-b border-gray-100 flex-row items-center"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <TouchableOpacity
        className="p-2 -ml-2"
        onPress={onBackPress}
        activeOpacity={0.7}
      >
        <Ionicons name="chevron-back" size={24} color="#374151" />
      </TouchableOpacity>

      <View className="flex-row items-center flex-1 ml-2">
        {avatar?.url ? (
          <Image
            source={{ uri: avatar.url }}
            className="w-10 h-10 rounded-full mr-3 border-2 border-gray-100"
          />
        ) : (
          <View className="w-10 h-10 bg-gray-300 rounded-full mr-3 items-center justify-center">
            <Text className="text-gray-600 font-semibold">
              {conversationName?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
        <View className="flex-1">
          <Text
            className="font-semibold text-base text-gray-900"
            numberOfLines={1}
          >
            {conversationName}
          </Text>
          <Text className="text-gray-500 text-sm">Active now</Text>
        </View>
      </View>

      <View className="flex-row items-center space-x-1">
        <TouchableOpacity
          className="p-2 rounded-full bg-gray-50"
          onPress={onSearchPress}
          activeOpacity={0.7}
        >
          <Ionicons name="search" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          className="p-2 rounded-full bg-gray-50"
          onPress={onOptionsPress}
          activeOpacity={0.7}
        >
          <Feather name="more-vertical" size={18} color="#6B7280" />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}
