import React from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import MessageBubble from "./MessageBubble";

interface MessagesListProps {
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
  conversationName: string;
}

export default function MessagesList({
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
  conversationName,
}: MessagesListProps) {
  const renderMessageItem = ({ item }: { item: ChatMessageResponse }) => {
    const isEditing = editingMessage?.id === item.id;
    const isMyMessage =
      item.sender === "me" || currentUserDetail?.id === item.sender;

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

  if (isMessagesLoading && messages.length === 0) {
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

  if (messages.length === 0) {
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
            <Ionicons name="chatbubble-outline" size={48} color="#EC4899" />
          </View>
          <Text className="text-gray-800 text-2xl font-bold mb-3 text-center">
            Start the conversation! 💬
          </Text>
          <Text className="text-gray-600 text-base text-center mb-6 leading-6">
            Send your first message to begin chatting with{" "}
            {conversationName || "this person"}
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
        className="flex-1 px-4 pt-4"
        data={messages}
        renderItem={renderMessageItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        inverted={true}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        style={{ flexGrow: 1 }}
      />
    </Animated.View>
  );
}
