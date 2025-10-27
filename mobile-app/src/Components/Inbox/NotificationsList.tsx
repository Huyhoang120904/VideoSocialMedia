import React from "react";
import { FlatList, RefreshControl } from "react-native";
import EmptyState from "./EmptyState";

interface NotificationsListProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function NotificationsList({
  refreshing,
  onRefresh,
}: NotificationsListProps) {
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
          icon="bell"
          iconColor="#F97316"
          iconBgColor="bg-orange-100"
          title="All caught up! 🎉"
          description="You have no new notifications right now"
          tip="🔔 You'll see notifications here when you receive them"
          tipBgColor="bg-orange-50"
          tipBorderColor="border-orange-200"
          tipTextColor="text-orange-700"
        />
      }
    />
  );
}
