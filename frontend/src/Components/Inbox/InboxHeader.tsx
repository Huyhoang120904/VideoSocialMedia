import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

interface InboxHeaderProps {
  onSearchPress: () => void;
  onCreateGroupPress: () => void;
}

export default function InboxHeader({
  onSearchPress,
  onCreateGroupPress,
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

        {/* Right: Group Icon */}
        <TouchableOpacity
          onPress={onCreateGroupPress}
          className="w-10 items-end p-1"
        >
          <Feather name="users" size={24} color="#333" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
