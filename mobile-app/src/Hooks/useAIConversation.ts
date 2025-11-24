import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import AiChatService from "../Services/AiChatService";

const AI_CONVERSATION_STORAGE_KEY = "@ai_conversation_id";

interface UseAIConversationProps {
  isAuthenticated: boolean;
  onConversationLoaded: (conversationId: string) => void;
  onError: () => void;
}

export const useAIConversation = ({
  isAuthenticated,
  onConversationLoaded,
  onError,
}: UseAIConversationProps) => {
  const [aiConversationId, setAiConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load or create AI conversation
  useEffect(() => {
    const loadAIConversation = async () => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      try {
        console.log("🤖 Getting AI conversation...");
        const aiConversationResponse =
          await AiChatService.getConversation();

        if (aiConversationResponse.result) {
          const conversationId = aiConversationResponse.result.conversationId;
          setAiConversationId(conversationId);

          // Store conversation ID for future sessions
          await AsyncStorage.setItem(
            AI_CONVERSATION_STORAGE_KEY,
            conversationId
          );
          console.log("💾 Stored AI conversation ID:", conversationId);

          onConversationLoaded(conversationId);
          console.log("✅ Successfully loaded AI conversation");
        }
      } catch (error: any) {
        console.error("❌ Error getting AI conversation:", error);
        // Clear any stored conversation ID if there's an error
        await AsyncStorage.removeItem(AI_CONVERSATION_STORAGE_KEY);
        setAiConversationId(null);
        onError();
      } finally {
        setIsLoading(false);
      }
    };

    loadAIConversation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const updateConversationId = async (conversationId: string) => {
    if (!aiConversationId && conversationId) {
      setAiConversationId(conversationId);
      await AsyncStorage.setItem(AI_CONVERSATION_STORAGE_KEY, conversationId);
      console.log("💾 Stored AI conversation ID:", conversationId);
    }
  };

  const clearConversation = async () => {
    try {
      await AsyncStorage.removeItem(AI_CONVERSATION_STORAGE_KEY);
      setAiConversationId(null);
      console.log("🗑️ AI conversation cleared");
    } catch (error) {
      console.error("Error clearing conversation:", error);
    }
  };

  return {
    aiConversationId,
    isLoading,
    updateConversationId,
    clearConversation,
  };
};

