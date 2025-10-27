import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

interface InboxHeaderProps {
  onSearchPress: () => void;
  onCreateGroupPress: () => void;
  onAiChatPress: () => void;
}

export default function InboxHeader({
  onSearchPress,
  onCreateGroupPress,
  onAiChatPress,
}: InboxHeaderProps) {
  return (
    <View className="px-4 pt-4 pb-3 border-b border-gray-100">
      <View className="flex-row items-center justify-between">
        {/* Left: Search Icon */}
        <TouchableOpacity onPress={onSearchPress} className="w-10">
          <Ionicons name="search" size={24} color="#333" />
        </TouchableOpacity>

        {/* Middle: Title */}
        <View className="flex-1 items-center">
          <Text className="text-xl font-bold">Inbox</Text>
        </View>

        {/* Right: AI Chat Icon and Group Icon */}
        <View className="flex-row items-center gap-3">
          <TouchableOpacity onPress={onAiChatPress} className="p-1">
            <Ionicons name="sparkles" size={24} color="#6366f1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onCreateGroupPress} className="p-1">
            <Feather name="users" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
