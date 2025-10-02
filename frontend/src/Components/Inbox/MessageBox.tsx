import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { ConversationResponse } from "../../Types/ConversationResponse";

interface MessageBoxProps {
  item: ConversationResponse;
  onPress: () => void;
}

const MessageBox: React.FC<MessageBoxProps> = ({ item, onPress }) => {
  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="relative">
        <Image
          source={{ uri: item.avatar.url }}
          className="w-12 h-12 rounded-full mr-3"
        />
        {/* {unread > 0 && (
          <View className="absolute top-0 right-2 bg-pink-600 rounded-full min-w-5 h-5 items-center justify-center">
            <Text className="text-white text-xs font-bold">{unread}</Text>
          </View>
        )} */}
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between">
          <Text className="font-bold text-base">{item.conversationName}</Text>
          {/* <Text className="text-gray-500 text-xs">{item.time ? "" : ""}</Text> */}
        </View>
        <Text className="text-gray-600 mt-1" numberOfLines={1}>
          {/* {message} */} "Place holder message"
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MessageBox;
