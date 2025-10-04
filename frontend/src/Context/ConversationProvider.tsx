import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { ApiResponse } from "../Types/ApiResponse";
import Page from "../Types/response/Page";
import { ConversationResponse } from "../Types/response/ConversationResponse";
import ConversationService from "../Services/ConversationService";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { useAuth } from "./AuthProvider";

type ConversationsContextType = {
  isLoading: boolean;
  conversations: ConversationResponse[];
  messages: ChatMessageResponse[];
  getMyConversations: () => void;
  getChatMessagesByConversationId: (conversationId: string) => void;
  clearConversations: () => void;
};

const ConversationContext = createContext<ConversationsContextType>({
  isLoading: false,
  conversations: [],
  messages: [],
  getMyConversations: () => {},
  getChatMessagesByConversationId: () => {},
  clearConversations: () => {},
});

export const ConversationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [conversations, setConversations] = useState<ConversationResponse[]>(
    []
  );

  const [messages, setMessages] = useState<ChatMessageResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated } = useAuth();

  async function getMyConversations() {
    if (!isAuthenticated) return;
    setIsLoading(true);
    const response = await ConversationService.getMyConversation();
    setConversations(response.result.content);
    console.log(response);
    setIsLoading(false);
  }

  async function clearConversations() {
    console.log("ConversationProvider: Clearing conversations and messages");
    setConversations([]);
    setMessages([]);
  }

  async function getChatMessagesByConversationId(conversationId: string) {
    setIsLoading(true);
    const response =
      await ConversationService.getMessagesByConversationId(conversationId);
    setMessages(response.result.content);
    console.log(response.result.content);
    setIsLoading(false);
  }

  useEffect(() => {
    if (isAuthenticated && conversations.length <= 0) {
      getMyConversations();
    } else if (!isAuthenticated) {
      // Clear conversations and messages when user logs out
      console.log("ConversationProvider: User logged out, clearing data");
      clearConversations();
    }
  }, [isAuthenticated]);

  const value = useMemo(
    () => ({
      isLoading,
      conversations,
      getMyConversations,
      messages,
      getChatMessagesByConversationId,
      clearConversations,
    }),
    [
      isLoading,
      conversations,
      getMyConversations,
      messages,
      getChatMessagesByConversationId,
      clearConversations,
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
