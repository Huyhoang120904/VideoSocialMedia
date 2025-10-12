import React, { useState } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConversationResponse } from "../../Types/response/ConversationResponse";
import { useConversations } from "../../Context/ConversationProvider";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import InboxHeader from "../../Components/Inbox/InboxHeader";
import TabNavigation from "../../Components/Inbox/TabNavigation";
import MessagesList from "../../Components/Inbox/MessagesList";
import NotificationsList from "../../Components/Inbox/NotificationsList";
import RequestsList from "../../Components/Inbox/RequestsList";

type InboxNavigationProp = StackNavigationProp<AuthedStackParamList>;

export default function Inbox() {
  const [activeTab, setActiveTab] = useState("Messages");
  const [refreshing, setRefreshing] = useState(false);
  const navigation = useNavigation<InboxNavigationProp>();
  const { conversations, isLoading, getMyConversations } = useConversations();

  const tabs = ["Messages", "Notifications", "Requests"];

  const handleMessagePress = (item: ConversationResponse) => {
    navigation.navigate("Conversation", {
      conversationId: item.conversationId,
      conversationName: item.conversationName,
      avatar: item.avatar,
    });
  };

  const navigateToSearch = () => {
    navigation.navigate("MainTabs", {
      screen: "Inbox",
      params: {
        screen: "UserSearch",
        params: {},
      },
    } as any);
  };

  const handleCreateGroup = () => {
    navigation.navigate("MainTabs", {
      screen: "Inbox",
      params: {
        screen: "CreateGroup",
      },
    } as any);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await getMyConversations();
    } catch (error) {
      console.error("Error refreshing conversations:", error);
      Alert.alert(
        "Error",
        "Failed to refresh conversations. Please try again."
      );
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "right", "left"]}>
      <InboxHeader
        onSearchPress={navigateToSearch}
        onCreateGroupPress={handleCreateGroup}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
        tabs={tabs}
      />

      {activeTab === "Messages" && (
        <MessagesList
          conversations={conversations}
          isLoading={isLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onMessagePress={handleMessagePress}
        />
      )}

      {activeTab === "Notifications" && (
        <NotificationsList refreshing={refreshing} onRefresh={handleRefresh} />
      )}

      {activeTab === "Requests" && (
        <RequestsList refreshing={refreshing} onRefresh={handleRefresh} />
      )}
    </SafeAreaView>
  );
}
