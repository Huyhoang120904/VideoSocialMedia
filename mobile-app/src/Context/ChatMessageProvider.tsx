import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
  useCallback,
} from "react";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { useAuth } from "./AuthProvider";
import { useSocket } from "./SocketProvider";
import { useConversations } from "./ConversationProvider";
import ChatMessageService from "../Services/ChatMessageService";
import UserDetailService from "../Services/UserDetailService";

type ChatMessageContextType = {
  isMessagesLoading: boolean;
  isLoadingMore: boolean;
  hasMoreMessages: boolean;
  messages: ChatMessageResponse[];
  currentConversationId: string | null;
  getChatMessagesByConversationId: (conversationId: string) => void;
  loadMoreMessages: () => Promise<void>;
  clearCurrentConversation: () => void;
  addMessage: (message: ChatMessageResponse) => void;
  updateMessage: (
    messageId: string,
    updatedMessage: ChatMessageResponse
  ) => void;
  removeMessage: (messageId: string) => void;
  updateMessageReadStatus: (
    messageId: string,
    readParticipantsId: string[],
    readCount: number
  ) => void;
  refreshMessages: () => Promise<void>;
};

const ChatMessageContext = createContext<ChatMessageContextType>({
  isMessagesLoading: false,
  isLoadingMore: false,
  hasMoreMessages: false,
  messages: [],
  currentConversationId: null,
  getChatMessagesByConversationId: () => {},
  loadMoreMessages: async () => {},
  clearCurrentConversation: () => {},
  addMessage: () => {},
  updateMessage: () => {},
  removeMessage: () => {},
  updateMessageReadStatus: () => {},
  refreshMessages: async () => {},
});

export const ChatMessageProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMoreMessages, setHasMoreMessages] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [userDetailId, setUserDetailId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const {
    updateConversationNewestMessage,
    updateConversationMessageReadStatus,
    markConversationAsRead,
  } = useConversations();
  const currentConversationId = useRef<string | null>(null);
  const subscribedConversations = useRef<Set<string>>(new Set());

  function addMessage(message: ChatMessageResponse) {
    setMessages((prev) => {
      // Check if message already exists by ID to avoid duplicates
      const existsById = prev.some((msg) => msg.id === message.id);
      if (existsById) {
        return prev;
      }

      // For messages with temp IDs (optimistic), also check by content and sender
      // to prevent duplicates when real message arrives
      if (message.id.startsWith("temp-")) {
        // This is an optimistic message, check if real version already exists
        const realVersionExists = prev.some(
          (msg) =>
            !msg.id.startsWith("temp-") &&
            msg.message === message.message &&
            msg.senderId === message.senderId &&
            msg.conversationId === message.conversationId
        );
        if (realVersionExists) {
          console.log(
            "⏭️ Real message already exists, skipping optimistic:",
            message.id
          );
          return prev;
        }
      } else {
        // This is a real message, check if optimistic version exists and replace it
        const optimisticVersion = prev.find((msg) => {
          if (!msg.id.startsWith("temp-")) return false;
          if (msg.message !== message.message) return false;
          if (msg.conversationId !== message.conversationId) return false;

          // Check if senders match
          const msgIsUser =
            msg.sender === "me" || msg.senderId === userDetailId;
          const newMsgIsUser =
            message.sender === "me" || message.senderId === userDetailId;

          // Both should be user messages or both should match by senderId
          return (
            (msgIsUser && newMsgIsUser) ||
            msg.senderId === message.senderId ||
            (msg.sender === "me" &&
              message.senderId === userDetailId &&
              userDetailId)
          );
        });

        if (optimisticVersion) {
          // Replace optimistic message with real one
          console.log(
            "🔄 Replacing optimistic message in provider:",
            optimisticVersion.id,
            "->",
            message.id
          );
          return prev.map((msg) =>
            msg.id === optimisticVersion.id ? message : msg
          );
        }
      }

      return [message, ...prev];
    });
  }

  function updateMessage(
    messageId: string,
    updatedMessage: ChatMessageResponse
  ) {
    setMessages((prev) =>
      prev.map((msg) => (msg.id === messageId ? updatedMessage : msg))
    );
  }

  function removeMessage(messageId: string) {
    setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
  }

  function updateMessageReadStatus(
    messageId: string,
    readParticipantsId: string[],
    readCount: number
  ) {
    if (!userDetailId) {
      console.warn("UserDetailId not available, skipping read status update");
      return;
    }

    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? {
              ...msg,
              readParticipantsId,
              readCount,
              isReadByCurrentUser: readParticipantsId.includes(userDetailId),
            }
          : msg
      )
    );
  }

  // WebSocket subscription for real-time messages
  function subscribeToConversationMessages(conversationId: string) {
    if (!isConnected) {
      console.log("❌ WebSocket not connected, cannot subscribe to messages");
      return;
    }

    if (!userDetailId) {
      console.log(
        "❌ UserDetailId not available, cannot subscribe to messages"
      );
      return;
    }

    // Subscribe to the user-specific chat endpoint (only once)
    if (!subscribedConversations.current.has("chat") && userDetailId) {
      const chatDestination = `/user/${userDetailId}/queue/chat`;
      console.log("🔔 Subscribing to real-time messages:", chatDestination);

      subscribe(chatDestination, (message: any) => {
        // Check if it's a ChatMessageResponse for the current conversation
        if (message && typeof message === "object" && message.conversationId) {
          console.log("📨 New message received:", message.message);

          try {
            // Always update conversation list with newest message (for inbox)
            // This ensures users see new messages even when not actively viewing the conversation
            updateConversationNewestMessage(message.conversationId, message);

            // Add message to current conversation if it's the active one
            if (currentConversationId.current === message.conversationId) {
              addMessage(message);
            } else {
              // If user is not viewing this conversation, they'll see it in their inbox
              console.log(
                "📨 Message received for conversation not currently viewed:",
                message.conversationId
              );
            }
          } catch (error) {
            console.error("❌ Error handling new message:", error);
          }
        }
      });

      // Subscribe to read status updates
      const readStatusDestination = `/user/${userDetailId}/queue/read-status`;
      console.log(
        "🔔 Subscribing to read status updates:",
        readStatusDestination
      );

      subscribe(readStatusDestination, (readStatusUpdate: any) => {
        if (
          readStatusUpdate &&
          readStatusUpdate.messageId &&
          readStatusUpdate.readParticipantsId
        ) {
          console.log("📖 Read status update received:", readStatusUpdate);

          try {
            // Update read status in current conversation messages
            updateMessageReadStatus(
              readStatusUpdate.messageId,
              readStatusUpdate.readParticipantsId,
              readStatusUpdate.readCount ||
                readStatusUpdate.readParticipantsId.length
            );

            // Update read status in conversation list if it's the newest message
            updateConversationMessageReadStatus(
              readStatusUpdate.conversationId,
              readStatusUpdate.messageId,
              readStatusUpdate.readParticipantsId,
              readStatusUpdate.readCount ||
                readStatusUpdate.readParticipantsId.length
            );
          } catch (error) {
            console.error("❌ Error handling read status update:", error);
          }
        }
      });

      subscribedConversations.current.add("chat");
      console.log("✅ Real-time messaging enabled");
    }

    // Track this conversation as active
    subscribedConversations.current.add(conversationId);
  }

  // Unsubscribe from conversation messages
  function unsubscribeFromConversationMessages(conversationId: string) {
    if (!subscribedConversations.current.has(conversationId)) {
      return;
    }

    // Remove this conversation from tracking
    subscribedConversations.current.delete(conversationId);

    // Only unsubscribe from chat endpoint if no conversations are active
    const activeConversations = Array.from(
      subscribedConversations.current
    ).filter((id) => id !== "chat");
    if (activeConversations.length === 0 && userDetailId) {
      const chatDestination = `/user/${userDetailId}/queue/chat`;
      unsubscribe(chatDestination);
      subscribedConversations.current.delete("chat");
      console.log("🔇 Real-time messaging disabled");
    }
  }

  const getChatMessagesByConversationId = useCallback(
    async (conversationId: string) => {
      // Prevent loading if already loading the same conversation
      if (
        currentConversationId.current === conversationId &&
        isMessagesLoading
      ) {
        return;
      }

      setIsMessagesLoading(true);
      setCurrentPage(0);
      setHasMoreMessages(true);
      try {
        // Validate conversationId
        if (!conversationId || conversationId.trim() === "") {
          console.log("⚠️ No conversation ID provided, skipping message load");
          setMessages([]);
          setIsMessagesLoading(false);
          return;
        }

        // Set current conversation ID for WebSocket subscriptions
        currentConversationId.current = conversationId;

        const response = await ChatMessageService.getMessagesByConversationId(
          conversationId,
          { page: 0, size: 20 }
        );

        if (!response.result) {
          console.error("❌ Invalid response structure:", response);
          setMessages([]);
          setIsMessagesLoading(false);
          return;
        }

        const messages = response.result.content || [];
        const pageNumber = response.result.number ?? 0;
        const totalPages = response.result.totalPages ?? 1;

        setMessages(messages);
        setCurrentPage(0);
        setHasMoreMessages(pageNumber < totalPages - 1);

        console.log("📥 Loaded", messages.length, "messages");
        setIsMessagesLoading(false);

        // Mark conversation as read when user opens it
        markConversationAsRead(conversationId);

        // Subscribe to real-time messages for this conversation
        subscribeToConversationMessages(conversationId);
      } catch (error: any) {
        console.error("❌ Error loading messages:", error.message);
        console.error("Error details:", error);
        if (error.response?.data) {
          console.error(
            "Response data:",
            JSON.stringify(error.response.data, null, 2)
          );
        }
        setIsMessagesLoading(false);

        // Handle specific error cases
        if (error.response?.status === 404) {
          console.error("Conversation not found or access denied");
          setMessages([]);
          // Don't throw the error, just log it and continue
        } else if (error.response?.status === 401) {
          console.error("Authentication failed");
          setMessages([]);
        } else {
          setMessages([]);
        }
      }
    },
    [isMessagesLoading, markConversationAsRead]
  );

  const loadMoreMessages = useCallback(async () => {
    if (
      !currentConversationId.current ||
      isLoadingMore ||
      !hasMoreMessages ||
      isMessagesLoading
    ) {
      return;
    }

    setIsLoadingMore(true);
    try {
      const nextPage = currentPage + 1;
      const response = await ChatMessageService.getMessagesByConversationId(
        currentConversationId.current,
        { page: nextPage, size: 20 }
      );

      if (!response.result) {
        console.error("❌ Invalid response structure:", response);
        setHasMoreMessages(false);
        setIsLoadingMore(false);
        return;
      }

      const newMessages = response.result.content || [];
      const pageNumber = response.result.number ?? nextPage;
      const totalPages = response.result.totalPages ?? 1;

      if (newMessages.length > 0) {
        setMessages((prev) => [...prev, ...newMessages]);
        setCurrentPage(nextPage);
        setHasMoreMessages(pageNumber < totalPages - 1);
        console.log("📥 Loaded", newMessages.length, "more messages");
      } else {
        setHasMoreMessages(false);
      }
    } catch (error: any) {
      console.error("❌ Error loading more messages:", error.message);
    } finally {
      setIsLoadingMore(false);
    }
  }, [currentPage, isLoadingMore, hasMoreMessages, isMessagesLoading]);

  // Refresh messages when user returns to a conversation
  const refreshMessages = useCallback(async () => {
    if (currentConversationId.current) {
      console.log(
        "🔄 Refreshing messages for conversation:",
        currentConversationId.current
      );
      await getChatMessagesByConversationId(currentConversationId.current);
    }
  }, [getChatMessagesByConversationId]);

  const clearCurrentConversation = useCallback(() => {
    // Unsubscribe from current conversation
    if (currentConversationId.current) {
      unsubscribeFromConversationMessages(currentConversationId.current);
    }

    // Clear current conversation state
    currentConversationId.current = null;
    setMessages([]);
    setCurrentPage(0);
    setHasMoreMessages(true);
  }, []);

  // Fetch userDetailId when authenticated
  useEffect(() => {
    if (isAuthenticated && !userDetailId) {
      const fetchUserDetailId = async () => {
        try {
          const response = await UserDetailService.getMyDetails();
          if (response.result) {
            setUserDetailId(response.result.id);
            console.log("👤 User details loaded");
          }
        } catch (error) {
          console.error("❌ Error fetching user details:", error);
        }
      };
      fetchUserDetailId();
    }
  }, [isAuthenticated, userDetailId]);

  // Clear messages when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      setUserDetailId(null);
      clearCurrentConversation();

      // Unsubscribe from all conversations
      const activeConversations = Array.from(
        subscribedConversations.current
      ).filter((id) => id !== "chat");
      activeConversations.forEach((conversationId) => {
        subscribedConversations.current.delete(conversationId);
      });

      // Unsubscribe from chat endpoint if it was subscribed
      if (subscribedConversations.current.has("chat") && userDetailId) {
        const chatDestination = `/user/${userDetailId}/queue/chat`;
        unsubscribe(chatDestination);
        subscribedConversations.current.delete("chat");
      }

      subscribedConversations.current.clear();
    }
  }, [isAuthenticated, userDetailId]);

  // Handle WebSocket connection changes
  useEffect(() => {
    if (isConnected && currentConversationId.current) {
      // Re-subscribe to current conversation when WebSocket reconnects
      subscribeToConversationMessages(currentConversationId.current);
    }
  }, [isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Unsubscribe from all conversations on unmount
      const activeConversations = Array.from(
        subscribedConversations.current
      ).filter((id) => id !== "chat");
      activeConversations.forEach((conversationId) => {
        subscribedConversations.current.delete(conversationId);
      });

      // Unsubscribe from chat endpoint if it was subscribed
      if (subscribedConversations.current.has("chat") && userDetailId) {
        const chatDestination = `/user/${userDetailId}/queue/chat`;
        unsubscribe(chatDestination);
        subscribedConversations.current.delete("chat");
      }
    };
  }, [userDetailId]);

  const value = useMemo(
    () => ({
      isMessagesLoading,
      isLoadingMore,
      hasMoreMessages,
      messages,
      currentConversationId: currentConversationId.current,
      getChatMessagesByConversationId,
      loadMoreMessages,
      clearCurrentConversation,
      addMessage,
      updateMessage,
      removeMessage,
      updateMessageReadStatus,
      refreshMessages,
    }),
    [
      isMessagesLoading,
      isLoadingMore,
      hasMoreMessages,
      messages,
      getChatMessagesByConversationId,
      loadMoreMessages,
      clearCurrentConversation,
      addMessage,
      updateMessage,
      removeMessage,
      updateMessageReadStatus,
      refreshMessages,
    ]
  );

  return (
    <ChatMessageContext.Provider value={value}>
      {children}
    </ChatMessageContext.Provider>
  );
};

export const useChatMessages = (): ChatMessageContextType => {
  const context = useContext(ChatMessageContext);
  if (!context) {
    throw new Error(
      "useChatMessages must be used within a ChatMessageProvider"
    );
  }
  return context;
};

export default ChatMessageProvider;
