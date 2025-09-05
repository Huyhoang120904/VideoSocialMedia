import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Image,
  StatusBar,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

// Mock messages for the conversation
const mockConversation = [
  {
    id: "1",
    text: "Hey there! How are you?",
    sender: "other",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    text: "I'm good, thanks! How about you?",
    sender: "me",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    text: "Just watched your latest video. It was amazing!",
    sender: "other",
    timestamp: "10:33 AM",
  },
  {
    id: "4",
    text: "Thank you so much! I put a lot of effort into it.",
    sender: "me",
    timestamp: "10:35 AM",
  },
  {
    id: "5",
    text: "It definitely shows. The editing was top-notch.",
    sender: "other",
    timestamp: "10:36 AM",
  },
];

const ConversationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [message, setMessage] = useState("");

  // Get params from navigation - safely handle them in case they're missing
  const params =
    (route.params as { userId?: string; username?: string; avatar?: any }) ||
    {};
  const username = params.username || "User";
  const avatar = params.avatar || require("../../../assets/avatar.png");

  // Handle sending a message
  const handleSend = () => {
    if (message.trim()) {
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  // Message bubble component
  const renderMessageItem = ({
    item,
  }: {
    item: { id: string; text: string; sender: string; timestamp: string };
  }) => (
    <View
      className={`px-4 py-3 mb-2 max-w-[80%] rounded-2xl ${
        item.sender === "me"
          ? "bg-pink-600 self-end rounded-br-none"
          : "bg-gray-100 self-start rounded-bl-none"
      }`}
    >
      <Text
        className={`${item.sender === "me" ? "text-white" : "text-gray-800"}`}
      >
        {item.text}
      </Text>
      <Text
        className={`text-xs mt-1 ${item.sender === "me" ? "text-pink-100" : "text-gray-500"}`}
      >
        {item.timestamp}
      </Text>
    </View>
  );

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "right", "left"]} // Don't include bottom to avoid unnecessary padding
    >
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        {/* Header */}
        <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
          <TouchableOpacity
            className="pr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1">
            <Image source={avatar} className="w-8 h-8 rounded-full mr-3" />
            <View>
              <Text className="font-bold text-base">@{username}</Text>
              <Text className="text-gray-500 text-xs">Active now</Text>
            </View>
          </View>

          <TouchableOpacity className="pl-3">
            <Feather name="more-vertical" size={20} color="#333" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <FlatList
          className="flex-1 px-4 pt-4"
          data={mockConversation}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
          inverted={false}
        />

        {/* Message Input */}
        <View className="px-4 py-2 border-t border-gray-200 flex-row items-center">
          <TouchableOpacity className="mr-2">
            <Feather name="plus-circle" size={24} color="#666" />
          </TouchableOpacity>

          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            placeholder="Type a message..."
            value={message}
            onChangeText={setMessage}
            multiline
            maxLength={500}
          />

          <TouchableOpacity
            className={`rounded-full p-2 ${message.trim() ? "bg-pink-600" : "bg-gray-300"}`}
            onPress={handleSend}
            disabled={!message.trim()}
          >
            <Ionicons name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ConversationScreen;
