import React from "react";
import { View, Text, TouchableOpacity } from "react-native";

interface TabNavigationProps {
  activeTab: string;
  onTabPress: (tab: string) => void;
  tabs: string[];
}

export default function TabNavigation({
  activeTab,
  onTabPress,
  tabs,
}: TabNavigationProps) {
  return (
    <View className="flex-row border-b border-gray-200">
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab}
          className={`flex-1 py-3 items-center ${
            activeTab === tab ? "border-b-2 border-pink-600" : ""
          }`}
          onPress={() => onTabPress(tab)}
        >
          <Text
            className={`font-medium ${
              activeTab === tab ? "text-pink-600" : "text-gray-600"
            }`}
          >
            {tab}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
