import React, { useState, useEffect } from "react";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConversationResponse } from "../../Types/response/ConversationResponse";
import { useConversations } from "../../Context/ConversationProvider";
import { useNewestMessage } from "../../Context/NewestMessageProvider";
import { useNotifications } from "../../Context/NotificationProvider";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import InboxHeader from "../../Components/Inbox/InboxHeader";
import TabNavigation from "../../Components/Inbox/TabNavigation";
import MessagesList from "../../Components/Inbox/MessagesList";
import NotificationsList from "../../Components/Inbox/NotificationsList";
import RequestsList from "../../Components/Inbox/RequestsList";
import NewestMessageIndicator from "../../Components/Inbox/NewestMessageIndicator";
import UserDetailService from "../../Services/UserDetailService";
import { getAvatarUrl, UNKNOWN_AVATAR } from "../../Utils/ImageUrlHelper";

type InboxNavigationProp = StackNavigationProp<AuthedStackParamList>;

export default function Inbox() {
  const [activeTab, setActiveTab] = useState("Messages");
  const [refreshing, setRefreshing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const navigation = useNavigation<InboxNavigationProp>();
  const { conversations, isLoading, getMyConversations } = useConversations();
  const { isConnected: newestMessageConnected } = useNewestMessage();
  const { refreshNotifications } = useNotifications();

  useEffect(() => {
    // Load current user details to get their ID for avatar filtering
    const loadCurrentUser = async () => {
      try {
        const response = await UserDetailService.getMyDetails();
        if (response.result) {
          setCurrentUserId(response.result.id);
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };
    loadCurrentUser();
  }, []);

  // Log newest message connection status
  useEffect(() => {
    console.log(
      "📢 Newest message connection status:",
      newestMessageConnected ? "Connected" : "Disconnected"
    );
  }, [newestMessageConnected]);

  const tabs = ["Messages", "Notifications", "Requests"];

  const handleMessagePress = (item: ConversationResponse) => {
    // For direct conversations, get the other user's avatar
    // For group conversations, use conversation avatar or first participant
    let avatarUrl: string | null = null;

    if (item.conversationType === "DIRECT" && item.userDetails?.length > 0) {
      const otherUser = item.userDetails.find(
        (user) => user.id !== currentUserId
      );
      if (otherUser?.avatar?.fileName && otherUser.id) {
        avatarUrl = getAvatarUrl(otherUser.id, otherUser.avatar.fileName);
      }
    } else if (item.userDetails?.length > 0) {
      const firstUser = item.userDetails[0];
      if (firstUser?.avatar?.fileName && firstUser.id) {
        avatarUrl = getAvatarUrl(firstUser.id, firstUser.avatar.fileName);
      }
    }

    navigation.navigate("Conversation", {
      conversationId: item.conversationId,
      conversationName: item.conversationName,
      avatar: avatarUrl ? { uri: avatarUrl } : UNKNOWN_AVATAR,
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

  const handleAIChatPress = () => {
    // Navigate to AIChat screen in the parent AuthedStack
    const parentNavigation =
      navigation.getParent<StackNavigationProp<AuthedStackParamList>>();
    if (parentNavigation) {
      parentNavigation.navigate("AIChat");
    } else {
      // Fallback: try direct navigation
      navigation.navigate("AIChat" as never);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      if (activeTab === "Messages") {
        await getMyConversations();
      } else if (activeTab === "Notifications") {
        await refreshNotifications();
      }
      // Add refresh logic for Requests tab if needed
    } catch (error) {
      console.error("Error refreshing:", error);
      Alert.alert("Error", "Failed to refresh. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "right", "left"]}>
      <InboxHeader
        onSearchPress={navigateToSearch}
        onCreateGroupPress={handleCreateGroup}
        onAIChatPress={handleAIChatPress}
      />

      <TabNavigation
        activeTab={activeTab}
        onTabPress={setActiveTab}
        tabs={tabs}
      />

      {/* Newest Message Indicator for testing */}
      {/* <NewestMessageIndicator /> */}

      {activeTab === "Messages" && (
        <MessagesList
          conversations={conversations.filter(
            (conv) =>
              conv.conversationName !== "AI Assistant" &&
              conv.conversationId !== "ai-assistant"
          )}
          isLoading={isLoading}
          refreshing={refreshing}
          onRefresh={handleRefresh}
          onMessagePress={handleMessagePress}
          currentUserId={currentUserId}
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
