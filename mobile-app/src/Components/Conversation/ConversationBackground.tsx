import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function ConversationBackground() {
  return (
    <>
      {/* Clean Background with subtle gradient */}
      <LinearGradient
        colors={["#fafafa", "#ffffff", "#f8fafc"]}
        className="absolute inset-0"
      />

      {/* Minimal decorative elements */}
      <View className="absolute top-20 right-8 w-16 h-16 bg-pink-100 rounded-full opacity-20" />
      <View className="absolute bottom-32 left-6 w-12 h-12 bg-blue-100 rounded-full opacity-15" />
    </>
  );
}

