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
import { useAuth } from "./AuthProvider";

type ConversationsContextType = {
  isLoading: boolean;
  conversations: ConversationResponse[];
  getMyConversations: () => void;
  clearConversations: () => void;
  addConversation: (conversation: ConversationResponse) => void;
  refreshConversations: () => Promise<void>;
};

const ConversationContext = createContext<ConversationsContextType>({
  isLoading: false,
  conversations: [],
  getMyConversations: () => {},
  clearConversations: () => {},
  addConversation: () => {},
  refreshConversations: async () => {},
});

export const ConversationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    []
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
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

  useEffect(() => {
    if (isAuthenticated && !hasLoadedConversations.current) {
      getMyConversations();
      hasLoadedConversations.current = true;
    } else if (!isAuthenticated) {
      // Clear conversations when user logs out
      console.log("ConversationProvider: User logged out, clearing data");
      clearConversations();
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
    }),
    [
      isLoading,
      conversations,
      getMyConversations,
      clearConversations,
      addConversation,
      refreshConversations,
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
