import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Animated } from "react-native";

interface ConversationHeaderProps {
  conversationName: string;
  avatarUrl?: string | null;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onBackPress: () => void;
  onSearchPress: () => void;
  onOptionsPress: () => void;
  isAiConversation?: boolean;
}

export default function ConversationHeader({
  conversationName,
  avatarUrl,
  fadeAnim,
  slideAnim,
  onBackPress,
  onSearchPress,
  onOptionsPress,
  isAiConversation = false,
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
        {isAiConversation ? (
          <View className="w-10 h-10 bg-indigo-100 rounded-full mr-3 items-center justify-center">
            <Ionicons name="sparkles" size={20} color="#6366f1" />
          </View>
        ) : avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-10 h-10 rounded-full mr-3 border-2 border-gray-100"
            style={{ resizeMode: "cover" }}
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
          <Text className="text-gray-500 text-sm">
            {isAiConversation ? "Always active" : "Active now"}
          </Text>
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
