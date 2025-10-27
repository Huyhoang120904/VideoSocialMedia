import React from "react";
import { View, Text } from "react-native";
import { Feather } from "@expo/vector-icons";

interface EmptyStateProps {
  icon: string;
  iconColor: string;
  iconBgColor: string;
  title: string;
  description: string;
  tip: string;
  tipBgColor: string;
  tipBorderColor: string;
  tipTextColor: string;
}

export default function EmptyState({
  icon,
  iconColor,
  iconBgColor,
  title,
  description,
  tip,
  tipBgColor,
  tipBorderColor,
  tipTextColor,
}: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-20 px-8">
      <View className="items-center">
        <View
          className={`w-20 h-20 ${iconBgColor} rounded-full items-center justify-center mb-6`}
        >
          <Feather name={icon as any} size={40} color={iconColor} />
        </View>
        <Text className="text-gray-800 text-xl font-bold mb-2">{title}</Text>
        <Text className="text-gray-600 text-base text-center mb-4">
          {description}
        </Text>
        <View
          className={`${tipBgColor} rounded-2xl p-4 border ${tipBorderColor}`}
        >
          <Text className={`${tipTextColor} text-sm text-center font-medium`}>
            {tip}
          </Text>
        </View>
      </View>
    </View>
  );
}
