import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { ConversationResponse } from "../../Types/response/ConversationResponse";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

interface MessageBoxProps {
  item: ConversationResponse;
  onPress: () => void;
  currentUserId?: string;
}

const MessageBox: React.FC<MessageBoxProps> = ({
  item,
  onPress,
  currentUserId,
}) => {
  // For direct conversations, get the other user's avatar
  // For group conversations, use conversation avatar or first participant
  const getConversationAvatar = () => {
    if (item.conversationType === "DIRECT" && item.userDetails?.length > 0) {
      // Find the other user (not current user)
      const otherUser = item.userDetails.find(
        (user) => user.id !== currentUserId
      );
      if (otherUser?.avatar?.fileName && otherUser.id) {
        return getAvatarUrl(otherUser.id, otherUser.avatar.fileName);
      }
    } else if (item.userDetails?.length > 0) {
      // For groups, try to use the first user's avatar
      const firstUser = item.userDetails[0];
      if (firstUser?.avatar?.fileName && firstUser.id) {
        return getAvatarUrl(firstUser.id, firstUser.avatar.fileName);
      }
    }
    return null;
  };

  const avatarUrl = getConversationAvatar();

  return (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View className="relative">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-12 h-12 rounded-full mr-3"
          />
        ) : (
          <View className="w-12 h-12 bg-gray-300 rounded-full mr-3 items-center justify-center">
            <Text className="text-gray-600 font-semibold">
              {item.conversationName?.charAt(0).toUpperCase() || "?"}
            </Text>
          </View>
        )}
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
