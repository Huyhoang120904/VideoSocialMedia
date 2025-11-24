import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface ProfileHeaderProps {
  onLogout: () => void;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({ onLogout }) => {
  return (
    <View className="flex-row justify-between items-center px-4 py-3">
      <Text className="text-gray-900 text-lg font-semibold">Profile</Text>
      <TouchableOpacity
        className="px-4 py-2 bg-gray-200 rounded-lg"
        onPress={onLogout}
      >
        <Text className="text-gray-800 text-sm">Log Out</Text>
      </TouchableOpacity>
    </View>
  );
};

