import React from "react";
import { View, Text, FlatList, RefreshControl } from "react-native";
import { ConversationResponse } from "../../Types/response/ConversationResponse";
import MessageBox from "./MessageBox";
import EmptyState from "./EmptyState";

interface MessagesListProps {
  conversations: ConversationResponse[];
  isLoading: boolean;
  refreshing: boolean;
  onRefresh: () => void;
  onMessagePress: (item: ConversationResponse) => void;
}

export default function MessagesList({
  conversations,
  isLoading,
  refreshing,
  onRefresh,
  onMessagePress,
}: MessagesListProps) {
  const renderMessageItem = ({ item }: { item: ConversationResponse }) => (
    <MessageBox onPress={() => onMessagePress(item)} item={item} />
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={conversations}
      renderItem={renderMessageItem}
      keyExtractor={(item) => item.conversationId}
      className="flex-1"
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={["#EC4899"]} // Android
          tintColor="#EC4899" // iOS
          title="Pull to refresh" // iOS
          titleColor="#666" // iOS
        />
      }
      ListEmptyComponent={
        <EmptyState
          icon="message-circle"
          iconColor="#EC4899"
          iconBgColor="bg-pink-100"
          title="Welcome to your Inbox! 👋"
          description="Start connecting with people and begin meaningful conversations"
          tip="💡 Tip: Use the search icon to find people to chat with"
          tipBgColor="bg-pink-50"
          tipBorderColor="border-pink-200"
          tipTextColor="text-pink-700"
        />
      }
    />
  );
}
