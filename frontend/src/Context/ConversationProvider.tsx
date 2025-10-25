import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { ApiResponse } from "../Types/ApiResponse";
import Page from "../Types/response/Page";
import { ConversationResponse } from "../Types/response/ConversationResponse";
import ConversationService from "../Services/ConversationService";
import UserDetailService from "../Services/UserDetailService";
import { useAuth } from "./AuthProvider";

type ConversationsContextType = {
  isLoading: boolean;
  conversations: ConversationResponse[];
  getMyConversations: () => void;
  clearConversations: () => void;
  addConversation: (conversation: ConversationResponse) => void;
  refreshConversations: () => Promise<void>;
  updateConversationNewestMessage: (
    conversationId: string,
    newestMessage: any
  ) => void;
  updateConversationMessageReadStatus: (
    conversationId: string,
    messageId: string,
    readParticipantsId: string[],
    readCount: number
  ) => void;
  markConversationAsRead: (conversationId: string) => void;
};

const ConversationContext = createContext<ConversationsContextType>({
  isLoading: false,
  conversations: [],
  getMyConversations: () => {},
  clearConversations: () => {},
  addConversation: () => {},
  refreshConversations: async () => {},
  updateConversationNewestMessage: () => {},
  updateConversationMessageReadStatus: () => {},
  markConversationAsRead: () => {},
});

export const ConversationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    []
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [userDetailId, setUserDetailId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const hasLoadedConversations = useRef(false);

  async function getMyConversations() {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const response = await ConversationService.getMyConversation();
    setConversations(response.result.content);
    console.log(response);
    setIsLoading(false);
  }

  async function clearConversations() {
    console.log("ConversationProvider: Clearing conversations");
    setConversations([]);
  }

  function addConversation(conversation: ConversationResponse) {
    console.log("ConversationProvider: Adding new conversation:", conversation);
    setConversations((prev) => {
      // Check if conversation already exists
      const existingIndex = prev.findIndex(
        (c) => c.conversationId === conversation.conversationId
      );

      if (existingIndex !== -1) {
        // Conversation exists, merge with existing data and move it to the top
        const existingConversation = prev[existingIndex];
        const mergedConversation = {
          ...existingConversation, // Keep existing data
          ...conversation, // Override with new data
          // Preserve userDetails if not provided in new conversation
          userDetails:
            conversation.userDetails && conversation.userDetails.length > 0
              ? conversation.userDetails
              : existingConversation.userDetails,
          // Preserve avatar if not provided in new conversation
          avatar: conversation.avatar || existingConversation.avatar,
        };

        const updated = [...prev];
        updated.splice(existingIndex, 1);
        return [mergedConversation, ...updated];
      }

      // New conversation, add to top
      return [conversation, ...prev];
    });
  }

  async function refreshConversations() {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const response = await ConversationService.getMyConversation();
      setConversations(response.result.content);
      console.log("ConversationProvider: Refreshed conversations");
    } catch (error) {
      console.error("Error refreshing conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function updateConversationNewestMessage(
    conversationId: string,
    newestMessage: any
  ) {
    console.log(
      "ConversationProvider: Updating newest message for conversation:",
      conversationId
    );

    if (!conversationId || !newestMessage) {
      console.warn("Invalid parameters for newest message update");
      return;
    }

    setConversations((prev) => {
      // Find the conversation to update
      const conversationIndex = prev.findIndex(
        (c) => c.conversationId === conversationId
      );

      if (conversationIndex === -1) {
        console.warn("Conversation not found:", conversationId);
        return prev;
      }

      const currentConversation = prev[conversationIndex];

      // Check if the message is from the current user
      const isFromCurrentUser =
        newestMessage.sender === "me" ||
        newestMessage.senderId === userDetailId;

      // Update the conversation with new message and unread status
      const updatedConversation = {
        ...currentConversation,
        newestChatMessage: newestMessage,
        // Only mark as unread if the message is not from the current user
        hasUnreadMessages: !isFromCurrentUser,
        unreadCount: isFromCurrentUser
          ? currentConversation.unreadCount || 0
          : (currentConversation.unreadCount || 0) + 1,
      };

      // Remove from current position and add to top
      const filtered = prev.filter((c) => c.conversationId !== conversationId);
      return [updatedConversation, ...filtered];
    });
  }

  function updateConversationMessageReadStatus(
    conversationId: string,
    messageId: string,
    readParticipantsId: string[],
    readCount: number
  ) {
    console.log(
      "ConversationProvider: Updating read status for message in conversation:",
      conversationId
    );

    if (!conversationId || !messageId || !readParticipantsId) {
      console.warn("Invalid parameters for read status update");
      return;
    }

    setConversations((prev) => {
      return prev.map((conversation) => {
        if (
          conversation.conversationId === conversationId &&
          conversation.newestChatMessage &&
          conversation.newestChatMessage.id === messageId
        ) {
          // Update the newest message's read status
          const updatedConversation = {
            ...conversation,
            newestChatMessage: {
              ...conversation.newestChatMessage,
              readParticipantsId,
              readCount,
              isReadByCurrentUser: readParticipantsId.includes(
                userDetailId || ""
              ),
            },
          };
          return updatedConversation;
        }
        return conversation;
      });
    });
  }

  function markConversationAsRead(conversationId: string) {
    console.log(
      "ConversationProvider: Marking conversation as read:",
      conversationId
    );

    setConversations((prev) => {
      return prev.map((conversation) => {
        if (conversation.conversationId === conversationId) {
          return {
            ...conversation,
            hasUnreadMessages: false,
            unreadCount: 0,
          };
        }
        return conversation;
      });
    });
  }

  // Load userDetailId when authenticated
  useEffect(() => {
    if (isAuthenticated && !userDetailId) {
      const fetchUserDetailId = async () => {
        try {
          const response = await UserDetailService.getMyDetails();
          if (response.result) {
            setUserDetailId(response.result.id);
            console.log("👤 User details loaded in ConversationProvider");
          }
        } catch (error) {
          console.error(
            "❌ Error fetching user details in ConversationProvider:",
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

  useEffect(() => {
    if (isAuthenticated && !hasLoadedConversations.current) {
      getMyConversations();
      hasLoadedConversations.current = true;
    } else if (!isAuthenticated) {
      // Clear conversations when user logs out
      console.log("ConversationProvider: User logged out, clearing data");
      clearConversations();
      setUserDetailId(null);
      hasLoadedConversations.current = false;
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      isLoading,
      conversations,
      getMyConversations,
      clearConversations,
      addConversation,
      refreshConversations,
      updateConversationNewestMessage,
      updateConversationMessageReadStatus,
      markConversationAsRead,
    }),
    [
      isLoading,
      conversations,
      getMyConversations,
      clearConversations,
      addConversation,
      refreshConversations,
      updateConversationNewestMessage,
      updateConversationMessageReadStatus,
      markConversationAsRead,
    ]
  );

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversations = () => {
  return useContext(ConversationContext);
};
