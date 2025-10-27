import React from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
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

  // Get the latest message preview
  const getLatestMessage = () => {
    if (item.newestChatMessage?.message) {
      const message = item.newestChatMessage.message;
      return message.length > 50 ? message.substring(0, 50) + "..." : message;
    }
    return "No messages yet";
  };

  // Get the time of the latest message
  const getLatestMessageTime = () => {
    if (item.newestChatMessage?.createdAt) {
      const date = new Date(item.newestChatMessage.createdAt);
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 1) {
        return "now";
      } else if (diffInHours < 24) {
        return `${Math.floor(diffInHours)}h`;
      } else {
        return `${Math.floor(diffInHours / 24)}d`;
      }
    }
    return "";
  };

  // Check if the latest message is from current user
  const isLatestMessageFromCurrentUser = () => {
    return item.newestChatMessage?.sender === "me";
  };

  // Check if the latest message is unread by current user
  const isLatestMessageUnread = () => {
    if (!item.newestChatMessage || isLatestMessageFromCurrentUser()) {
      return false;
    }
    return !item.newestChatMessage.isReadByCurrentUser;
  };

  // Get read status indicators for the latest message
  const getReadStatusIndicators = () => {
    if (!item.newestChatMessage || !isLatestMessageFromCurrentUser()) {
      return null;
    }

    const message = item.newestChatMessage;
    const hasReadStatus = message.readCount && message.readCount > 0;

    if (!hasReadStatus) {
      return (
        <View className="flex-row items-center">
          <Ionicons name="checkmark" size={12} color="#9CA3AF" />
        </View>
      );
    }

    return (
      <View className="flex-row items-center space-x-1">
        <Ionicons
          name="checkmark-done"
          size={12}
          color={message.isReadByCurrentUser ? "#34D399" : "#9CA3AF"}
        />
        {message.readCount > 1 && (
          <Text className="text-xs text-gray-400">{message.readCount}</Text>
        )}
      </View>
    );
  };

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
        <View className="flex-row justify-between items-center">
          <Text
            className={`font-bold text-base ${isLatestMessageUnread() ? "text-gray-900" : ""}`}
          >
            {item.conversationName}
          </Text>
          <View className="flex-row items-center space-x-2">
            {getReadStatusIndicators()}
            <Text className="text-gray-500 text-xs">
              {getLatestMessageTime()}
            </Text>
          </View>
        </View>
        <Text
          className={`mt-1 ${isLatestMessageUnread() ? "font-bold text-gray-900" : "text-gray-600"}`}
          numberOfLines={1}
        >
          {getLatestMessage()}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

export default MessageBox;
