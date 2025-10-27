import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { useAuth } from "./AuthProvider";
import { useSocket } from "./SocketProvider";
import { useConversations } from "./ConversationProvider";
import UserDetailService from "../Services/UserDetailService";

type NewestMessageBroadcast = {
  conversationId: string;
  message: ChatMessageResponse;
  conversationType?: string;
  participantCount?: number;
  timestamp: number;
};

type NewestMessageContextType = {
  isConnected: boolean;
  subscribeToNewestMessages: () => void;
  unsubscribeFromNewestMessages: () => void;
  onNewestMessage: (
    callback: (broadcast: NewestMessageBroadcast) => void
  ) => void;
  offNewestMessage: (
    callback: (broadcast: NewestMessageBroadcast) => void
  ) => void;
};

const NewestMessageContext = createContext<NewestMessageContextType>({
  isConnected: false,
  subscribeToNewestMessages: () => {},
  unsubscribeFromNewestMessages: () => {},
  onNewestMessage: () => {},
  offNewestMessage: () => {},
});

export const NewestMessageProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [userDetailId, setUserDetailId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { isConnected: socketConnected, subscribe, unsubscribe } = useSocket();
  const { updateConversationNewestMessage } = useConversations();

  const newestMessageCallbacks = useRef<
    Set<(broadcast: NewestMessageBroadcast) => void>
  >(new Set());
  const isSubscribed = useRef<boolean>(false);

  // Subscribe to newest message broadcasts
  function subscribeToNewestMessages() {
    if (!socketConnected) {
      console.log(
        "❌ WebSocket not connected, cannot subscribe to newest messages"
      );
      return;
    }

    if (!userDetailId) {
      console.log(
        "❌ UserDetailId not available, cannot subscribe to newest messages"
      );
      return;
    }

    if (isSubscribed.current) {
      console.log("📢 Already subscribed to newest messages");
      return;
    }

    const destination = `/user/${userDetailId}/queue/newest-message`;
    console.log("📢 Subscribing to newest message broadcasts:", destination);

    subscribe(destination, (broadcast: NewestMessageBroadcast) => {
      console.log("📢 Newest message broadcast received:", broadcast);

      try {
        // Update conversation list with newest message
        updateConversationNewestMessage(
          broadcast.conversationId,
          broadcast.message
        );

        // Notify all registered callbacks
        newestMessageCallbacks.current.forEach((callback) => {
          try {
            callback(broadcast);
          } catch (error) {
            console.error("❌ Error in newest message callback:", error);
          }
        });
      } catch (error) {
        console.error("❌ Error handling newest message broadcast:", error);
      }
    });

    isSubscribed.current = true;
    setIsConnected(true);
    console.log("✅ Newest message broadcasting enabled");
  }

  // Unsubscribe from newest message broadcasts
  function unsubscribeFromNewestMessages() {
    if (!isSubscribed.current) {
      return;
    }

    if (userDetailId) {
      const destination = `/user/${userDetailId}/queue/newest-message`;
      unsubscribe(destination);
      console.log("🔇 Unsubscribed from newest message broadcasts");
    }

    isSubscribed.current = false;
    setIsConnected(false);
  }

  // Register callback for newest message events
  function onNewestMessage(
    callback: (broadcast: NewestMessageBroadcast) => void
  ) {
    newestMessageCallbacks.current.add(callback);
  }

  // Unregister callback for newest message events
  function offNewestMessage(
    callback: (broadcast: NewestMessageBroadcast) => void
  ) {
    newestMessageCallbacks.current.delete(callback);
  }

  // Fetch userDetailId when authenticated
  useEffect(() => {
    if (isAuthenticated && !userDetailId) {
      const fetchUserDetailId = async () => {
        try {
          const response = await UserDetailService.getMyDetails();
          if (response.result) {
            setUserDetailId(response.result.id);
            console.log("👤 User details loaded for newest message provider");
          }
        } catch (error) {
          console.error("❌ Error fetching user details:", error);
        }
      };
      fetchUserDetailId();
    }
  }, [isAuthenticated, userDetailId]);

  // Auto-subscribe when authenticated and connected
  useEffect(() => {
    if (
      isAuthenticated &&
      socketConnected &&
      userDetailId &&
      !isSubscribed.current
    ) {
      subscribeToNewestMessages();
    }
  }, [isAuthenticated, socketConnected, userDetailId]);

  // Handle WebSocket connection changes
  useEffect(() => {
    if (socketConnected && userDetailId && !isSubscribed.current) {
      subscribeToNewestMessages();
    } else if (!socketConnected) {
      unsubscribeFromNewestMessages();
    }
  }, [socketConnected, userDetailId]);

  // Cleanup on logout
  useEffect(() => {
    if (!isAuthenticated) {
      setUserDetailId(null);
      unsubscribeFromNewestMessages();
      newestMessageCallbacks.current.clear();
    }
  }, [isAuthenticated]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromNewestMessages();
      newestMessageCallbacks.current.clear();
    };
  }, []);

  const value = useMemo(
    () => ({
      isConnected,
      subscribeToNewestMessages,
      unsubscribeFromNewestMessages,
      onNewestMessage,
      offNewestMessage,
    }),
    [isConnected]
  );

  return (
    <NewestMessageContext.Provider value={value}>
      {children}
    </NewestMessageContext.Provider>
  );
};

export const useNewestMessage = (): NewestMessageContextType => {
  const context = useContext(NewestMessageContext);
  if (!context) {
    throw new Error(
      "useNewestMessage must be used within a NewestMessageProvider"
    );
  }
  return context;
};

export default NewestMessageProvider;
