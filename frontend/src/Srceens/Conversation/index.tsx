import React, { useEffect, useState } from "react";
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
  Keyboard,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConversations } from "../../Context/ConversationProvider";
import { ChatMessageResponse } from "../../Types/ChatMessageResponse";

const ConversationScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const [message, setMessage] = useState("");
  // Get params from navigation - safely handle them in case they're missing
  const params =
    (route.params as {
      conversationId: string;
      conversationName?: string;
      avatar?: any;
    }) || {};

  const conversationName = params.conversationName || "Placeholder";
  const avatar = params.avatar || require("../../../assets/avatar.png");

  const { messages, getChatMessagesByConversationId } = useConversations();

  useEffect(() => {
    getChatMessagesByConversationId(params.conversationId);
  }, []);

  console.log(messages);

  const handleSend = () => {
    if (message.trim()) {
      const newMessage = {
        id: String(Date.now()),
        text: message.trim(),
        sender: "me",
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };

      // Add new message to the messages state
      // setMessages([newMessage, ...messages]);
      console.log("Message sent:", message);
      setMessage("");
    }
  };

  // Message bubble component
  const renderMessageItem = ({ item }: { item: ChatMessageResponse }) => (
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
        {item.message}
      </Text>
      <Text
        className={`text-xs mt-1 ${item.sender === "me" ? "text-pink-100" : "text-gray-500"}`}
      >
        {item.time}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <SafeAreaView edges={["top", "right", "left"]}>
        <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
          <TouchableOpacity
            className="pr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <View className="flex-row items-center flex-1">
            <Image
              source={{ uri: avatar.url }}
              className="w-8 h-8 rounded-full mr-3"
            />
            <View>
              <Text className="font-bold text-base">{conversationName}</Text>
              <Text className="text-gray-500 text-xs">Active now</Text>
            </View>
          </View>

          <TouchableOpacity className="pl-3">
            <Feather name="more-vertical" size={20} color="#333" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages */}
        <FlatList
          className="flex-1 px-4 pt-4"
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 10 }}
          inverted={true}
        />

        {/* Message Input */}
        <SafeAreaView edges={["bottom"]}>
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
              onSubmitEditing={() => {
                handleSend();
                Keyboard.dismiss();
              }}
            />

            <TouchableOpacity
              className={`rounded-full p-2 ${message.trim() ? "bg-pink-600" : "bg-gray-300"}`}
              onPress={handleSend}
              disabled={!message.trim()}
            >
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ConversationScreen;
