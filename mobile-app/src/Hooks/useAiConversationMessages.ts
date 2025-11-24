import { useState } from "react";
import { Alert } from "react-native";
import AiChatService from "../Services/AiChatService";
import ChatMessageService from "../Services/ChatMessageService";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { ChatMessageType } from "../Types/common/ChatMessageType";
import { ChatMessageUpdateRequest } from "../Types/request";
import { UserDetailResponse } from "../Types/response/UserDetailResponse";

interface UseAiConversationMessagesProps {
  conversationId: string;
  currentUserDetail: UserDetailResponse | null;
  onMessageAdded: (message: ChatMessageResponse) => void;
  onMessageUpdated: (messageId: string, message: ChatMessageResponse) => void;
  onMessageRemoved: (messageId: string) => void;
}

export const useAiConversationMessages = ({
  conversationId,
  currentUserDetail,
  onMessageAdded,
  onMessageUpdated,
  onMessageRemoved,
}: UseAiConversationMessagesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] =
    useState<ChatMessageResponse | null>(null);
  const [editText, setEditText] = useState("");

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      // Create optimistic user message
      // IMPORTANT: sender must be "me" (string literal) for AI conversations
      const USER_SENDER = "me" as const;
      const userMessage: ChatMessageResponse = {
        id: `temp-user-${Date.now()}-${Math.random()}`,
        message: message.trim(),
        messageType: ChatMessageType.TEXT,
        sender: USER_SENDER,
        senderId: currentUserDetail?.id || "",
        conversationId: conversationId || "",
        createdAt: new Date().toISOString(),
        edited: false,
        readParticipantsId: [],
        isReadByCurrentUser: false,
        readCount: 0,
      };

      // Verify the message structure before adding
      if (userMessage.sender !== "me") {
        console.error(
          "❌ ERROR: User message sender is not 'me':",
          userMessage.sender
        );
      }

      // Add user message optimistically
      console.log("📤 Creating optimistic user message:", {
        id: userMessage.id,
        message: userMessage.message,
        sender: userMessage.sender,
        senderId: userMessage.senderId,
        senderType: typeof userMessage.sender,
      });
      onMessageAdded(userMessage);

      // Send message to AI and get response
      const response = await AiChatService.sendMessage({
        message: message.trim(),
      });

      if (response.result) {
        // The API response is the AI's response
        const aiResponse = response.result;
        console.log("🤖 AI response received:", {
          id: aiResponse.id,
          message: aiResponse.message,
          sender: aiResponse.sender,
          senderId: aiResponse.senderId,
        });
        onMessageAdded(aiResponse);
      }
    } catch (error) {
      console.error("Error sending AI message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
      // Note: In a production app, you might want to remove the optimistic message on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    setIsLoading(true);
    try {
      const updateRequest: ChatMessageUpdateRequest = {
        message: newText.trim(),
      };

      const response = await ChatMessageService.updateChatMessage(
        messageId,
        updateRequest
      );

      if (response.result) {
        onMessageUpdated(messageId, response.result);
        console.log("✏️ AI message updated");
        setEditingMessage(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Error updating AI message:", error);
      Alert.alert("Error", "Failed to update message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await ChatMessageService.deleteChatMessage(messageId);
              onMessageRemoved(messageId);
              console.log("🗑️ AI message deleted");
            } catch (error) {
              console.error("Error deleting AI message:", error);
              Alert.alert(
                "Error",
                "Failed to delete message. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const startEditing = (message: ChatMessageResponse) => {
    setEditingMessage(message);
    setEditText(message.message || "");
  };

  const cancelEditing = () => {
    setEditingMessage(null);
    setEditText("");
  };

  const saveEdit = () => {
    if (editingMessage && editText.trim()) {
      handleEditMessage(editingMessage.id, editText);
    }
  };

  return {
    isLoading,
    editingMessage,
    editText,
    setEditText,
    handleSend,
    handleEditMessage,
    handleDeleteMessage,
    startEditing,
    cancelEditing,
    saveEdit,
  };
};
