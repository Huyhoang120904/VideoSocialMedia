import React from "react";
import { FlatList, RefreshControl } from "react-native";
import EmptyState from "./EmptyState";

interface RequestsListProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function RequestsList({
  refreshing,
  onRefresh,
}: RequestsListProps) {
  return (
    <FlatList
      data={[]}
      renderItem={() => null}
      keyExtractor={() => "empty"}
      className="flex-1"
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
          icon="user-plus"
          iconColor="#3B82F6"
          iconBgColor="bg-blue-100"
          title="No pending requests 📭"
          description="Message requests from people you don't follow will appear here"
          tip="👥 Connect with more people to see requests here"
          tipBgColor="bg-blue-50"
          tipBorderColor="border-blue-200"
          tipTextColor="text-blue-700"
        />
      }
    />
  );
}
