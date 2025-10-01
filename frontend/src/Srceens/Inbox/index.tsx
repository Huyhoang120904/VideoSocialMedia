import React, { useEffect, useState } from "react";
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
import MessageBox from "../../Components/Inbox/MessageBox";
import ConversationService from "../../Services/ConversationService";
import { ConversationResponse } from "../../Types/ConversationResponse";
import { useConversations } from "../../Context/ConversationProvider";

export default function Inbox() {
  const [activeTab, setActiveTab] = useState("Messages");
  const navigation = useNavigation();
  const { conversations, isLoading } = useConversations();
  const handleMessagePress = (item: ConversationResponse) => {
    (navigation as any).navigate("Conversation", {
      conversationId: item.conversationId,
      conversationName: item.conversationName,
      avatar: item.avatar,
    });
  };

  const navigateToSearch = () => {
    // Replace with actual navigation when Search screen is available
    Alert.alert("Navigation", "Navigating to Search screen");
  };

  const handleCreateGroup = () => {
    Alert.alert("Create Group", "Create group chat functionality");
  };

  const renderMessageItem = ({ item }: { item: ConversationResponse }) => (
    <MessageBox onPress={() => handleMessagePress(item)} item={item} />
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
        {activeTab === "Messages" &&
          (!isLoading ? (
            <FlatList
              data={conversations}
              renderItem={renderMessageItem}
              keyExtractor={(item) => item.conversationId}
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
          ) : (
            <View>
              <Text> Loading...</Text>
            </View>
          ))}

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
