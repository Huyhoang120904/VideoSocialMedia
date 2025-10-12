import { createContext, useContext, useEffect, useMemo, useState, useRef } from "react";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { useAuth } from "./AuthProvider";
import { useSocket } from "./SocketProvider";
import ChatMessageService from "../Services/ChatMessageService";
import UserDetailService from "../Services/UserDetailService";

type ChatMessageContextType = {
  isMessagesLoading: boolean;
  messages: ChatMessageResponse[];
  currentConversationId: string | null;
  getChatMessagesByConversationId: (conversationId: string) => void;
  clearCurrentConversation: () => void;
  addMessage: (message: ChatMessageResponse) => void;
  updateMessage: (messageId: string, updatedMessage: ChatMessageResponse) => void;
  removeMessage: (messageId: string) => void;
};

const ChatMessageContext = createContext<ChatMessageContextType>({
  isMessagesLoading: false,
  messages: [],
  currentConversationId: null,
  getChatMessagesByConversationId: () => {},
  clearCurrentConversation: () => {},
  addMessage: () => {},
  updateMessage: () => {},
  removeMessage: () => {},
});

export const ChatMessageProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState<boolean>(false);
  const [userDetailId, setUserDetailId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { isConnected, subscribe, unsubscribe } = useSocket();
  const currentConversationId = useRef<string | null>(null);
  const subscribedConversations = useRef<Set<string>>(new Set());

  function addMessage(message: ChatMessageResponse) {
    setMessages((prev) => {
      // Check if message already exists to avoid duplicates
      const exists = prev.some(msg => msg.id === message.id);
      if (exists) {
        return prev;
      }
      return [message, ...prev];
    });
  }

  function updateMessage(messageId: string, updatedMessage: ChatMessageResponse) {
    setMessages((prev) => 
      prev.map(msg => msg.id === messageId ? updatedMessage : msg)
    );
  }

  function removeMessage(messageId: string) {
    setMessages((prev) => prev.filter(msg => msg.id !== messageId));
  }

  // WebSocket subscription for real-time messages
  function subscribeToConversationMessages(conversationId: string) {
    if (!isConnected) {
      console.log("❌ WebSocket not connected, cannot subscribe to messages");
      return;
    }

    if (!userDetailId) {
      console.log("❌ UserDetailId not available, cannot subscribe to messages");
      return;
    }
    
    // Subscribe to the user-specific chat endpoint (only once)
    if (!subscribedConversations.current.has('chat') && userDetailId) {
      const chatDestination = `/user/${userDetailId}/queue/chat`;
      console.log("🔔 Subscribing to real-time messages:", chatDestination);
      
      subscribe(chatDestination, (message: any) => {
        // Check if it's a ChatMessageResponse for the current conversation
        if (message && typeof message === 'object' && message.conversationId) {
          // Only add message if it's for the current conversation
          if (currentConversationId.current === message.conversationId) {
            console.log("📨 New message received:", message.message);
            addMessage(message);
          }
        }
      });
      
      subscribedConversations.current.add('chat');
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
    const activeConversations = Array.from(subscribedConversations.current).filter(id => id !== 'chat');
    if (activeConversations.length === 0 && userDetailId) {
      const chatDestination = `/user/${userDetailId}/queue/chat`;
      unsubscribe(chatDestination);
      subscribedConversations.current.delete('chat');
      console.log("🔇 Real-time messaging disabled");
    }
  }

  async function getChatMessagesByConversationId(conversationId: string) {
    setIsMessagesLoading(true);
    try {
      // Validate conversationId
      if (!conversationId || conversationId.trim() === '') {
        throw new Error("Invalid conversation ID");
      }
      
      // Set current conversation ID for WebSocket subscriptions
      currentConversationId.current = conversationId;
      
      const response = await ChatMessageService.getMessagesByConversationId(conversationId);
      setMessages(response.result.content);
      console.log("📥 Loaded", response.result.content.length, "messages");
      setIsMessagesLoading(false);
      
      // Subscribe to real-time messages for this conversation
      subscribeToConversationMessages(conversationId);
      
    } catch (error: any) {
      console.error("❌ Error loading messages:", error.message);
      setIsMessagesLoading(false);
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        console.error("Conversation not found or access denied");
        setMessages([]);
      } else if (error.response?.status === 401) {
        console.error("Authentication failed");
        setMessages([]);
      } else {
        setMessages([]);
      }
    }
  }

  function clearCurrentConversation() {
    // Unsubscribe from current conversation
    if (currentConversationId.current) {
      unsubscribeFromConversationMessages(currentConversationId.current);
    }
    
    // Clear current conversation state
    currentConversationId.current = null;
    setMessages([]);
  }

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
      const activeConversations = Array.from(subscribedConversations.current).filter(id => id !== 'chat');
      activeConversations.forEach(conversationId => {
        subscribedConversations.current.delete(conversationId);
      });
      
      // Unsubscribe from chat endpoint if it was subscribed
      if (subscribedConversations.current.has('chat') && userDetailId) {
        const chatDestination = `/user/${userDetailId}/queue/chat`;
        unsubscribe(chatDestination);
        subscribedConversations.current.delete('chat');
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
      const activeConversations = Array.from(subscribedConversations.current).filter(id => id !== 'chat');
      activeConversations.forEach(conversationId => {
        subscribedConversations.current.delete(conversationId);
      });
      
      // Unsubscribe from chat endpoint if it was subscribed
      if (subscribedConversations.current.has('chat') && userDetailId) {
        const chatDestination = `/user/${userDetailId}/queue/chat`;
        unsubscribe(chatDestination);
        subscribedConversations.current.delete('chat');
      }
    };
  }, [userDetailId]);

  const value = useMemo(
    () => ({
      isMessagesLoading,
      messages,
      currentConversationId: currentConversationId.current,
      getChatMessagesByConversationId,
      clearCurrentConversation,
      addMessage,
      updateMessage,
      removeMessage,
    }),
    [
      isMessagesLoading,
      messages,
      getChatMessagesByConversationId,
      clearCurrentConversation,
      addMessage,
      updateMessage,
      removeMessage,
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
    throw new Error("useChatMessages must be used within a ChatMessageProvider");
  }
  return context;
};

export default ChatMessageProvider;
