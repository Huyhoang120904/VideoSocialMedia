import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { ApiResponse } from "../Types/ApiResponse";
import Page from "../Types/response/Page";
import { NotificationResponse } from "../Types/response/NotificationResponse";
import NotificationService from "../Services/NotificationService";
import UserDetailService from "../Services/UserDetailService";
import { useAuth } from "./AuthProvider";
import { useSocket } from "./SocketProvider";
import { showLocalNotification } from "../Utils/NotificationHelper";

type NotificationContextType = {
  isLoading: boolean;
  notifications: NotificationResponse[];
  unreadCount: number;
  getNotifications: (unreadOnly?: boolean) => void;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  clearNotifications: () => void;
  addNotification: (notification: NotificationResponse) => void;
};

const NotificationContext = createContext<NotificationContextType>({
  isLoading: false,
  notifications: [],
  unreadCount: 0,
  getNotifications: () => {},
  refreshNotifications: async () => {},
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  clearNotifications: () => {},
  addNotification: () => {},
});

// Notification destination will be constructed with userDetailId

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationResponse[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userDetailId, setUserDetailId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const hasLoadedNotifications = useRef(false);
  const isSubscribed = useRef(false);
  const currentDestination = useRef<string | null>(null);

  // Calculate unread count
  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.read).length;
  }, [notifications]);

  const getNotifications = useCallback(
    async (unreadOnly: boolean = false) => {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const response = await NotificationService.getNotifications({
          page: 0,
          size: 50,
          unreadOnly,
        });
        setNotifications(response.result.content);
        console.log("📬 Notifications loaded:", response.result.content.length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  const refreshNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await NotificationService.getNotifications({
        page: 0,
        size: 50,
        unreadOnly: false,
      });
      setNotifications(response.result.content);
      console.log("📬 Notifications refreshed");
    } catch (error) {
      console.error("Error refreshing notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await NotificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );
      console.log("✅ Notification marked as read:", notificationId);
    } catch (error) {
      console.error("Error marking notification as read:", error);
      throw error;
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await NotificationService.markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
          readAt: new Date().toISOString(),
        }))
      );
      console.log("✅ All notifications marked as read");
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      throw error;
    }
  }, []);

  const clearNotifications = useCallback(() => {
    console.log("NotificationProvider: Clearing notifications");
    setNotifications([]);
  }, []);

  const addNotification = useCallback(
    async (notification: NotificationResponse) => {
      console.log(
        "NotificationProvider: Adding new notification:",
        notification
      );

      setNotifications((prev) => {
        // Check if notification already exists
        const existingIndex = prev.findIndex((n) => n.id === notification.id);

        if (existingIndex !== -1) {
          // Notification exists, update it
          const updated = [...prev];
          updated[existingIndex] = notification;
          return updated;
        }

        // New notification, show local notification and add to top
        showLocalNotification(notification).catch((error) => {
          console.error("Error showing local notification:", error);
        });

        return [notification, ...prev];
      });
    },
    []
  );

  // Load userDetailId when authenticated
  useEffect(() => {
    if (isAuthenticated && !userDetailId) {
      const fetchUserDetailId = async () => {
        try {
          const response = await UserDetailService.getMyDetails();
          if (response.result) {
            setUserDetailId(response.result.id);
            console.log("👤 User details loaded in NotificationProvider");
          }
        } catch (error) {
          console.error(
            "❌ Error fetching user details in NotificationProvider:",
            error
          );
        }
      };
      fetchUserDetailId();
    }
  }, [isAuthenticated, userDetailId]);

  // Clear userDetailId when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setUserDetailId(null);
    }
  }, [isAuthenticated]);

  // WebSocket subscription for real-time notifications
  useEffect(() => {
    if (!isAuthenticated || !isConnected || !userDetailId) {
      if (isSubscribed.current && currentDestination.current) {
        console.log(
          "🔕 Unsubscribing from notifications (not authenticated/connected/userId)"
        );
        unsubscribe(currentDestination.current);
        isSubscribed.current = false;
        currentDestination.current = null;
      }
      return;
    }

    if (isSubscribed.current) {
      return; // Already subscribed
    }

    const destination = `/user/${userDetailId}/queue/notifications`;
    currentDestination.current = destination;
    console.log(
      "🔔 Setting up WebSocket subscription for notifications:",
      destination
    );

    const handleNotification = (notification: NotificationResponse) => {
      console.log("📬 Received notification via WebSocket:", notification);
      addNotification(notification);
    };

    try {
      subscribe(destination, handleNotification);
      isSubscribed.current = true;
      console.log("✅ Subscribed to notifications WebSocket");
    } catch (error) {
      console.error("❌ Error subscribing to notifications:", error);
      currentDestination.current = null;
    }

    return () => {
      if (isSubscribed.current && currentDestination.current) {
        console.log("🔕 Unsubscribing from notifications WebSocket");
        unsubscribe(currentDestination.current);
        isSubscribed.current = false;
        currentDestination.current = null;
      }
    };
  }, [
    isAuthenticated,
    isConnected,
    userDetailId,
    subscribe,
    unsubscribe,
    addNotification,
  ]);

  // Handle WebSocket connection changes
  useEffect(() => {
    if (
      isAuthenticated &&
      isConnected &&
      userDetailId &&
      !isSubscribed.current
    ) {
      // Re-subscribe when WebSocket reconnects
      const destination = `/user/${userDetailId}/queue/notifications`;
      const handleNotification = (notification: NotificationResponse) => {
        console.log("📬 Received notification via WebSocket:", notification);
        addNotification(notification);
      };

      try {
        subscribe(destination, handleNotification);
        isSubscribed.current = true;
        console.log("✅ Re-subscribed to notifications WebSocket");
      } catch (error) {
        console.error("❌ Error re-subscribing to notifications:", error);
      }
    }
  }, [isAuthenticated, isConnected, userDetailId, subscribe, addNotification]);

  // Load notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && !hasLoadedNotifications.current) {
      getNotifications();
      hasLoadedNotifications.current = true;
    } else if (!isAuthenticated) {
      // Clear notifications when user logs out
      console.log("NotificationProvider: User logged out, clearing data");
      clearNotifications();
      hasLoadedNotifications.current = false;
      if (isSubscribed.current && currentDestination.current) {
        unsubscribe(currentDestination.current);
        isSubscribed.current = false;
        currentDestination.current = null;
      }
    }
  }, [isAuthenticated, getNotifications, clearNotifications, unsubscribe]);

  const value = useMemo(
    () => ({
      isLoading,
      notifications,
      unreadCount,
      getNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      addNotification,
    }),
    [
      isLoading,
      notifications,
      unreadCount,
      getNotifications,
      refreshNotifications,
      markAsRead,
      markAllAsRead,
      clearNotifications,
      addNotification,
    ]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  return useContext(NotificationContext);
};
