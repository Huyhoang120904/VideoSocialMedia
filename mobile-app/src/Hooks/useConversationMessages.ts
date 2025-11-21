import { useState } from "react";
import { Alert } from "react-native";
import ChatMessageService from "../Services/ChatMessageService";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { ChatMessageUpdateRequest } from "../Types/request";
import { UserDetailResponse } from "../Types/response/UserDetailResponse";

interface UseConversationMessagesProps {
  conversationId: string;
  receiverId?: string;
  conversations: any[];
  currentUserDetail: UserDetailResponse | null;
  onMessageAdded: (message: ChatMessageResponse) => void;
  onMessageUpdated: (messageId: string, message: ChatMessageResponse) => void;
  onMessageRemoved: (messageId: string) => void;
}

export const useConversationMessages = ({
  conversationId,
  receiverId,
  conversations,
  currentUserDetail,
  onMessageAdded,
  onMessageUpdated,
  onMessageRemoved,
}: UseConversationMessagesProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] =
    useState<ChatMessageResponse | null>(null);
  const [editText, setEditText] = useState("");

  const handleSend = async (message: string) => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      let response;

      if (conversationId) {
        const conversation = conversations.find(
          (conv) => conv.conversationId === conversationId
        );
        if (
          !conversation ||
          !conversation.participantIds ||
          !currentUserDetail?.id
        ) {
          Alert.alert("Error", "Conversation data not available");
          return;
        }

        if (conversation.conversationType === "DIRECT") {
          response = await ChatMessageService.sendMessageToDirectConversation(
            conversationId,
            message.trim(),
            currentUserDetail.id,
            conversation.participantIds
          );
        } else if (conversation.conversationType === "GROUP") {
          response = await ChatMessageService.sendMessageToGroupConversation(
            conversationId,
            message.trim()
          );
        } else {
          Alert.alert("Error", "Unknown conversation type");
          return;
        }
      } else if (receiverId) {
        response = await ChatMessageService.sendDirectMessage(
          receiverId,
          message.trim()
        );
      } else {
        Alert.alert("Error", "No conversation or receiver specified");
        return;
      }

      if (response.result) {
        onMessageAdded(response.result);
        console.log("📤 Message sent:", response.result.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
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
        console.log("✏️ Message updated");
        setEditingMessage(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Error updating message:", error);
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
              console.log("🗑️ Message deleted");
            } catch (error) {
              console.error("Error deleting message:", error);
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
