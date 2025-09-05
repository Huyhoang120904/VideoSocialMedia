import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import MessageBox, { MessageProps } from "../../Components/Inbox/MessageBox";

// Mock data for messages
const mockMessages: MessageProps[] = [
  {
    id: "1",
    username: "john_doe",
    message: "Hey, how are you?",
    time: "2h",
    avatar: require("../../../assets/avatar.png"),
    unread: 2,
  },
  {
    id: "2",
    username: "jane_smith",
    message: "Loved your new video!",
    time: "5h",
    avatar: require("../../../assets/avatar.png"),
    unread: 0,
  },
  {
    id: "3",
    username: "mike_wilson",
    message: "Check out my new dance video",
    time: "1d",
    avatar: require("../../../assets/avatar.png"),
    unread: 1,
  },
  {
    id: "4",
    username: "sara_johnson",
    message: "Are you coming to the event?",
    time: "2d",
    avatar: require("../../../assets/avatar.png"),
    unread: 0,
  },
  {
    id: "5",
    username: "alex_turner",
    message: "Thanks for the follow!",
    time: "3d",
    avatar: require("../../../assets/avatar.png"),
    unread: 0,
  },
];

export default function Inbox() {
  const [activeTab, setActiveTab] = useState("Messages");
  const navigation = useNavigation();

  const handleMessagePress = (messageId: string) => {
    console.log(`Message ${messageId} pressed`);
    // Find the message data to pass to the conversation screen
    const messageData = mockMessages.find((msg) => msg.id === messageId);
    if (messageData) {
      // Use any type casting to work around type checking for navigation
      (navigation as any).navigate("Conversation", {
        userId: messageId,
        username: messageData.username,
        avatar: messageData.avatar,
      });
    }
  };

  const navigateToSearch = () => {
    // Replace with actual navigation when Search screen is available
    Alert.alert("Navigation", "Navigating to Search screen");
  };

  const handleCreateGroup = () => {
    Alert.alert("Create Group", "Create group chat functionality");
  };

  const renderMessageItem = ({ item }: { item: MessageProps }) => (
    <MessageBox {...item} onPress={() => handleMessagePress(item.id)} />
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "right", "left"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            {/* Left: Search Icon */}
            <TouchableOpacity onPress={navigateToSearch} className="w-10">
              <Ionicons name="search" size={24} color="#333" />
            </TouchableOpacity>

            {/* Middle: Title */}
            <View className="flex-1 items-center">
              <Text className="text-xl font-bold">Inbox</Text>
            </View>

            {/* Right: Group Icon */}
            <TouchableOpacity
              onPress={handleCreateGroup}
              className="w-10 items-end"
            >
              <Feather name="users" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs */}
        <View className="flex-row border-b border-gray-200">
          {["Messages", "Notifications", "Requests"].map((tab) => (
            <TouchableOpacity
              key={tab}
              className={`flex-1 py-3 items-center ${activeTab === tab ? "border-b-2 border-pink-600" : ""}`}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                className={`font-medium ${activeTab === tab ? "text-pink-600" : "text-gray-600"}`}
              >
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Message List */}
        {activeTab === "Messages" && (
          <FlatList
            data={mockMessages}
            renderItem={renderMessageItem}
            keyExtractor={(item) => item.id}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Feather name="message-circle" size={60} color="#ccc" />
                <Text className="text-gray-400 mt-4 text-lg">
                  No messages yet
                </Text>
              </View>
            }
          />
        )}

        {/* Notifications Tab */}
        {activeTab === "Notifications" && (
          <View className="flex-1 items-center justify-center">
            <Feather name="bell" size={60} color="#ccc" />
            <Text className="text-gray-400 mt-4 text-lg">
              No notifications yet
            </Text>
          </View>
        )}

        {/* Requests Tab */}
        {activeTab === "Requests" && (
          <View className="flex-1 items-center justify-center">
            <Feather name="user-plus" size={60} color="#ccc" />
            <Text className="text-gray-400 mt-4 text-lg">
              No message requests
            </Text>
          </View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
