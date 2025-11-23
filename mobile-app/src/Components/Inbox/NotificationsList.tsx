import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useNotifications } from "../../Context/NotificationProvider";
import {
  NotificationResponse,
  NotificationType,
} from "../../Types/response/NotificationResponse";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import NotificationItem from "./NotificationItem";
import EmptyState from "./EmptyState";

type NotificationNavigationProp = StackNavigationProp<AuthedStackParamList>;

interface NotificationsListProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function NotificationsList({
  refreshing,
  onRefresh,
}: NotificationsListProps) {
  const navigation = useNavigation<NotificationNavigationProp>();
  const {
    notifications,
    isLoading,
    unreadCount,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  const handleNotificationPress = (notification: NotificationResponse) => {
    // Mark as read if not already read
    if (!notification.read) {
      handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type
    if (
      notification.notificationType === NotificationType.MESSAGE &&
      notification.conversationId
    ) {
      navigation.navigate("Conversation", {
        conversationId: notification.conversationId,
        conversationName: notification.actor?.displayName || "Conversation",
      });
    } else if (notification.feedItemId) {
      // Navigate to feed item (video/post)
      // You may need to add a navigation route for this
      console.log("Navigate to feed item:", notification.feedItemId);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    if (markingAsRead === notificationId) return;

    setMarkingAsRead(notificationId);
    try {
      await markAsRead(notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      Alert.alert("Error", "Failed to mark notification as read");
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      Alert.alert("Success", "All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      Alert.alert("Error", "Failed to mark all notifications as read");
    }
  };

  const handleRefresh = async () => {
    onRefresh();
    await refreshNotifications();
  };

  const renderNotificationItem = ({ item }: { item: NotificationResponse }) => (
    <NotificationItem
      item={item}
      onPress={() => handleNotificationPress(item)}
      onMarkAsRead={handleMarkAsRead}
    />
  );

  if (isLoading && notifications.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-500 mt-2">Loading notifications...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1">
      {unreadCount > 0 && (
        <View className="px-4 py-2 bg-blue-50 border-b border-blue-100 flex-row justify-between items-center">
          <Text className="text-blue-700 text-sm font-medium">
            {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
          </Text>
          <TouchableOpacity
            onPress={handleMarkAllAsRead}
            className="px-3 py-1 bg-blue-500 rounded-full"
          >
            <Text className="text-white text-xs font-semibold">
              Mark all as read
            </Text>
          </TouchableOpacity>
        </View>
      )}
      <FlatList
        data={notifications}
        renderItem={renderNotificationItem}
        keyExtractor={(item) => item.id}
        className="flex-1"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#EC4899"]} // Android
            tintColor="#EC4899" // iOS
            title="Pull to refresh" // iOS
            titleColor="#666" // iOS
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="bell"
            iconColor="#F97316"
            iconBgColor="bg-orange-100"
            title="All caught up! 🎉"
            description="You have no new notifications right now"
            tip="🔔 You'll see notifications here when you receive them"
            tipBgColor="bg-orange-50"
            tipBorderColor="border-orange-200"
            tipTextColor="text-orange-700"
          />
        }
      />
    </View>
  );
}
