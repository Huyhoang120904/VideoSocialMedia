import React, { useMemo } from "react";
import { View, Text, FlatList, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Animated } from "react-native";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import MessageBubble from "./MessageBubble";

interface MessagesListProps {
  messages: ChatMessageResponse[];
  isMessagesLoading: boolean;
  isLoadingMore?: boolean;
  hasMoreMessages?: boolean;
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
  onLoadMore?: () => void;
  isLoading: boolean;
  conversationName: string;
  isAiConversation?: boolean;
}

interface MessageWithDateSeparator {
  type: "message" | "date";
  message?: ChatMessageResponse;
  date?: string;
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const isToday =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();

  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isToday) {
    return "Today";
  } else if (isYesterday) {
    return "Yesterday";
  } else {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
};

const isSameDay = (date1: string, date2: string): boolean => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return (
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear()
  );
};

export default function MessagesList({
  messages,
  isMessagesLoading,
  isLoadingMore = false,
  hasMoreMessages = false,
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
  onLoadMore,
  isLoading,
  conversationName,
  isAiConversation = false,
}: MessagesListProps) {
  const messagesWithDateSeparators = useMemo(() => {
    const result: MessageWithDateSeparator[] = [];
    let previousMessageDate: string | null = null;

    messages.forEach((message) => {
      const messageDate = message.createdAt;
      const shouldShowDateSeparator =
        previousMessageDate === null ||
        !isSameDay(messageDate, previousMessageDate);

      if (shouldShowDateSeparator) {
        result.push({
          type: "date",
          date: formatDate(messageDate),
        });
      }

      result.push({
        type: "message",
        message,
      });

      previousMessageDate = messageDate;
    });

    return result;
  }, [messages]);

  const renderItem = ({ item }: { item: MessageWithDateSeparator }) => {
    if (item.type === "date") {
      return (
        <View className="items-center my-4">
          <View className="bg-gray-200 px-4 py-1.5 rounded-full">
            <Text className="text-gray-600 text-xs font-medium">
              {item.date}
            </Text>
          </View>
        </View>
      );
    }

    if (!item.message) return null;

    const isEditing = editingMessage?.id === item.message.id;
    let isMyMessage: boolean;
    if (isAiConversation) {
      isMyMessage = item.message.sender === "me";
    } else {
      isMyMessage =
        item.message.sender === "me" ||
        (currentUserDetail?.id &&
          currentUserDetail.id === item.message.senderId);
    }

    return (
      <MessageBubble
        message={item.message}
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

  const keyExtractor = (item: MessageWithDateSeparator, index: number) => {
    if (item.type === "date") {
      return `date-${item.date}-${index}`;
    }
    return item.message?.id || `message-${index}`;
  };

  const handleEndReached = () => {
    if (hasMoreMessages && !isLoadingMore && onLoadMore) {
      onLoadMore();
    }
  };

  const renderFooter = () => {
    if (!isLoadingMore) return null;
    return (
      <View className="items-center py-4">
        <ActivityIndicator size="small" color="#EC4899" />
      </View>
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
        data={messagesWithDateSeparators}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
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
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
      />
    </Animated.View>
  );
}
