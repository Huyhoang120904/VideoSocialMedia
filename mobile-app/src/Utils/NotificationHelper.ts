import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import Constants from "expo-constants";
import { Platform } from "react-native";
import {
  NotificationResponse,
  NotificationType,
} from "../Types/response/NotificationResponse";

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 * @returns Promise<boolean> - true if permissions granted, false otherwise
 */
export async function registerForPushNotificationsAsync(): Promise<boolean> {
  let token: string | null = null;

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#EC4899",
      sound: "default",
      enableVibrate: true,
      showBadge: true,
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      console.warn("⚠️ Failed to get push token for push notification!");
      return false;
    }

    try {
      // Get projectId from Constants or environment variable
      const projectId =
        process.env.EXPO_PUBLIC_PROJECT_ID ||
        Constants.expoConfig?.extra?.eas?.projectId ||
        Constants.easConfig?.projectId;

      if (!projectId) {
        console.warn(
          "⚠️ No projectId found. Push token generation skipped. Set EXPO_PUBLIC_PROJECT_ID or configure EAS project."
        );
        // Still return true for local notifications to work
        return true;
      }

      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: projectId,
      });
      token = tokenData.data;
      console.log("📱 Push notification token:", token);
    } catch (error: any) {
      // If it's a projectId error, we can still use local notifications
      if (error?.message?.includes("projectId")) {
        console.warn(
          "⚠️ ProjectId not configured. Local notifications will still work, but push notifications require a projectId."
        );
        return true; // Return true to allow local notifications
      }
      console.error("❌ Error getting push token:", error);
      return false;
    }
  } else {
    console.warn("⚠️ Must use physical device for Push Notifications");
    return false;
  }

  return true;
}

/**
 * Get the notification icon name based on notification type
 */
function getNotificationIcon(notificationType: NotificationType): string {
  switch (notificationType) {
    case NotificationType.COMMENT:
      return "💬";
    case NotificationType.LIKE:
      return "❤️";
    case NotificationType.MESSAGE:
      return "✉️";
    default:
      return "🔔";
  }
}

/**
 * Show a local notification when a notification is received
 */
export async function showLocalNotification(
  notification: NotificationResponse
): Promise<void> {
  try {
    const icon = getNotificationIcon(notification.notificationType);
    const actorName =
      notification.actor?.displayName ||
      notification.actor?.shownName ||
      "Someone";

    await Notifications.scheduleNotificationAsync({
      content: {
        title: notification.title,
        body: notification.body,
        data: {
          notificationId: notification.id,
          notificationType: notification.notificationType,
          feedItemId: notification.feedItemId,
          commentId: notification.commentId,
          conversationId: notification.conversationId,
          messageId: notification.messageId,
        },
        sound: true,
        badge: 1,
      },
      trigger: null, // Show immediately
    });

    console.log("📬 Local notification shown:", notification.id);
  } catch (error) {
    console.error("❌ Error showing local notification:", error);
  }
}

/**
 * Cancel a specific notification
 */
export async function cancelNotification(
  notificationId: string
): Promise<void> {
  try {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch (error) {
    console.error("❌ Error canceling notification:", error);
  }
}

/**
 * Cancel all notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("❌ Error canceling all notifications:", error);
  }
}

/**
 * Get the last notification response (when app opens from notification)
 */
export function getLastNotificationResponse(): Notifications.NotificationResponse | null {
  return Notifications.getLastNotificationResponseAsync() as any;
}
