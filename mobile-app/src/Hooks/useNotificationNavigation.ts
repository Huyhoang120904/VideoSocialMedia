import { useEffect, useRef } from "react";
import * as Notifications from "expo-notifications";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthedStackParamList } from "../Types/response/navigation.types";
import { NotificationType } from "../Types/response/NotificationResponse";

type NotificationNavigationProp = StackNavigationProp<AuthedStackParamList>;

interface NotificationData {
  notificationId?: string;
  notificationType?: NotificationType;
  feedItemId?: string;
  commentId?: string;
  conversationId?: string;
  messageId?: string;
}

/**
 * Hook to handle notification taps and navigate to appropriate screens
 */
export const useNotificationNavigation = () => {
  const navigation = useNavigation<NotificationNavigationProp>();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  const handleNotificationNavigation = (data: NotificationData) => {
    console.log("👆 Notification tapped, navigating:", data);

    // Navigate based on notification type
    if (data.notificationType === NotificationType.MESSAGE && data.conversationId) {
      // Navigate to conversation
      navigation.navigate("Conversation", {
        conversationId: data.conversationId,
        conversationName: "Conversation",
      });
    } else if (data.feedItemId) {
      // Navigate to feed item (video/post)
      // You may need to add a navigation route for this
      // For now, navigate to home or user feed
      console.log("Navigate to feed item:", data.feedItemId);
      // navigation.navigate("FeedItem", { feedItemId: data.feedItemId });
    } else {
      // Default: navigate to inbox notifications tab
      try {
        navigation.navigate("MainTabs", {
          screen: "Inbox",
          params: {
            screen: "Inbox",
            params: {
              initialTab: "Notifications",
            },
          },
        } as any);
      } catch (error) {
        console.error("Error navigating to notifications:", error);
      }
    }
  };

  useEffect(() => {
    // Check if app was opened from a notification (cold start)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (response) {
        const data = response.notification.request.content.data as NotificationData;
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          handleNotificationNavigation(data);
        }, 1000);
      }
    });

    // Listen for notification taps (when app is running)
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content
          .data as NotificationData;
        handleNotificationNavigation(data);
      });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [navigation]);
};

