import React from "react";
import { View, Text, TouchableOpacity, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { NotificationResponse, NotificationType } from "../../Types/response/NotificationResponse";
import { getAvatarUrl, UNKNOWN_AVATAR } from "../../Utils/ImageUrlHelper";

interface NotificationItemProps {
  item: NotificationResponse;
  onPress: () => void;
  onMarkAsRead?: (notificationId: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  item,
  onPress,
  onMarkAsRead,
}) => {
  const getNotificationIcon = () => {
    switch (item.notificationType) {
      case NotificationType.COMMENT:
        return "chatbubble-outline";
      case NotificationType.LIKE:
        return "heart";
      case NotificationType.MESSAGE:
        return "mail-outline";
      default:
        return "notifications-outline";
    }
  };

  const getNotificationColor = () => {
    switch (item.notificationType) {
      case NotificationType.COMMENT:
        return "#3B82F6"; // Blue
      case NotificationType.LIKE:
        return "#EC4899"; // Pink
      case NotificationType.MESSAGE:
        return "#10B981"; // Green
      default:
        return "#6B7280"; // Gray
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return "now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d`;
    }
  };

  const handlePress = () => {
    if (!item.read && onMarkAsRead) {
      onMarkAsRead(item.id);
    }
    onPress();
  };

  const avatarUrl =
    item.actor?.avatar?.fileName && item.actor.id
      ? getAvatarUrl(item.actor.id, item.actor.avatar.fileName)
      : null;

  const displayName =
    item.actor?.displayName || item.actor?.shownName || "Someone";

  return (
    <TouchableOpacity
      className={`flex-row items-start px-4 py-3 border-b border-gray-100 ${
        !item.read ? "bg-blue-50" : "bg-white"
      }`}
      activeOpacity={0.7}
      onPress={handlePress}
    >
      <View className="relative mr-3">
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center">
            <Text className="text-gray-600 font-semibold">
              {displayName.charAt(0).toUpperCase()}
            </Text>
          </View>
        )}
        <View
          className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full items-center justify-center border-2 border-white"
          style={{ backgroundColor: getNotificationColor() }}
        >
          <Ionicons name={getNotificationIcon() as any} size={12} color="white" />
        </View>
      </View>

      <View className="flex-1">
        <View className="flex-row justify-between items-start mb-1">
          <View className="flex-1 mr-2">
            <Text className="font-semibold text-base text-gray-900">
              {item.title}
            </Text>
            <Text
              className={`text-sm mt-1 ${!item.read ? "font-medium text-gray-900" : "text-gray-600"}`}
              numberOfLines={2}
            >
              {item.body}
            </Text>
            {item.previewText && (
              <Text className="text-xs text-gray-500 mt-1" numberOfLines={1}>
                {item.previewText}
              </Text>
            )}
          </View>
          <View className="items-end">
            <Text className="text-gray-500 text-xs">
              {getTimeAgo(item.createdAt)}
            </Text>
            {!item.read && (
              <View className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
            )}
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default NotificationItem;

