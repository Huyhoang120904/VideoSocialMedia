import React, { useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import { ChatMessageType } from "../../Types/common/ChatMessageType";
import MessageBubble from "../Conversation/MessageBubble";

interface AIChatMessagesListProps {
  messages: ChatMessageResponse[];
  isMessagesLoading: boolean;
  editingMessage: ChatMessageResponse | null;
  editText: string;
  currentUserDetail: any;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onEditTextChange: (text: string) => void;
  onStartEditing: (message: ChatMessageResponse) => void;
  onCancelEditing: () => void;
  onSaveEdit: () => void;
  onDeleteMessage: (messageId: string) => void;
  isLoading: boolean;
  conversationName?: string;
}

export default function AIChatMessagesList({
  messages,
  isMessagesLoading,
  editingMessage,
  editText,
  currentUserDetail,
  fadeAnim,
  slideAnim,
  onEditTextChange,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDeleteMessage,
  isLoading,
  conversationName = "AI Assistant",
}: AIChatMessagesListProps) {
  // Normalize AI chat messages to ensure they have required fields
  // AI chat API responses may not include messageType and readParticipantsId
  const normalizedMessages = useMemo(() => {
    return messages.map((msg) => {
      const normalized = {
        ...msg,
        messageType: msg.messageType || ChatMessageType.TEXT,
        readParticipantsId: msg.readParticipantsId || [],
        // Preserve sender exactly as-is - do not modify it
        sender: msg.sender,
      };

      // Debug log for optimistic messages
      if (msg.id.startsWith("temp-")) {
        console.log("🔄 Normalizing optimistic message:", {
          originalSender: msg.sender,
          normalizedSender: normalized.sender,
          senderType: typeof normalized.sender,
          isMe: normalized.sender === "me",
          strictEqual: normalized.sender === "me",
        });
      }

      return normalized;
    });
  }, [messages]);

  // Helper to check if message is from user (robust comparison)
  // In AI conversations:
  // - sender === "me" → user message
  // - sender === currentUserDetail.id → user message (when API returns senderId)
  // - Otherwise → AI message
  const isUserMessage = (message: ChatMessageResponse): boolean => {
    if (!message.sender) return false;
    const sender = String(message.sender).trim();

    // Check if sender is "me" (optimistic messages or API format)
    if (sender === "me") return true;

    // Check if sender matches current user's ID (when API returns senderId)
    if (currentUserDetail?.id && sender === currentUserDetail.id) return true;

    // Everything else is AI
    return false;
  };

  const renderMessageItem = ({ item }: { item: ChatMessageResponse }) => {
    const isEditing = editingMessage?.id === item.id;
    // In AI conversations: only messages with sender === "me" are user messages
    // Messages with sender === "other" are AI assistant messages
    const isMyMessage = isUserMessage(item);

    // Debug log for message identification (especially for optimistic messages and AI messages)
    if (
      item.id.startsWith("temp-") ||
      item.sender === "me" ||
      item.sender === currentUserDetail?.id ||
      !isMyMessage
    ) {
      console.log("🔍 Rendering message:", {
        id: item.id,
        rawSender: item.sender,
        currentUserId: currentUserDetail?.id,
        senderType: typeof item.sender,
        isMyMessage,
        isUserMessageResult: isUserMessage(item),
        message: item.message?.substring(0, 30),
      });
    }

    return (
      <MessageBubble
        message={item}
        isMyMessage={isMyMessage}
        isEditing={isEditing}
        editText={editText}
        onEditTextChange={onEditTextChange}
        onStartEditing={onStartEditing}
        onCancelEditing={onCancelEditing}
        onSaveEdit={onSaveEdit}
        onDeleteMessage={onDeleteMessage}
        isLoading={isLoading}
      />
    );
  };

  if (isMessagesLoading && normalizedMessages.length === 0) {
    return (
      <View className="flex-1 justify-center items-center">
        <View className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 items-center shadow-sm border border-gray-100">
          <ActivityIndicator size="large" color="#EC4899" />
          <Text className="text-gray-600 mt-3 text-sm font-medium">
            Loading messages...
          </Text>
        </View>
      </View>
    );
  }

  if (normalizedMessages.length === 0) {
    return (
      <Animated.View
        className="flex-1 items-center justify-center px-8"
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
        }}
      >
        <View className="items-center">
          <View className="w-24 h-24 bg-pink-100 rounded-full items-center justify-center mb-6">
            <Ionicons name="sparkles-outline" size={48} color="#EC4899" />
          </View>
          <Text className="text-gray-800 text-2xl font-bold mb-3 text-center">
            Start chatting with AI! ✨
          </Text>
          <Text className="text-gray-600 text-base text-center mb-6 leading-6">
            Ask me anything! I'm here to help you with questions, suggestions,
            and more.
          </Text>
          <View className="bg-pink-50 rounded-2xl p-4 border border-pink-200 w-full">
            <Text className="text-pink-700 text-sm text-center font-medium">
              💡 Tip: Type a message below to get started
            </Text>
          </View>
        </View>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      className="flex-1"
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
    >
      <FlatList
        data={normalizedMessages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: 16,
        }}
        inverted={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={{ flex: 1 }}
        removeClippedSubviews={false}
      />
    </Animated.View>
  );
}
