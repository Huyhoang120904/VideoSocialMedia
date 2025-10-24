import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useConversations } from "../../Context/ConversationProvider";
import { useChatMessages } from "../../Context/ChatMessageProvider";
import { useAuth } from "../../Context/AuthProvider";
import { useSocket } from "../../Context/SocketProvider";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import ChatMessageService from "../../Services/ChatMessageService";
import UserDetailService from "../../Services/UserDetailService";
import { ChatMessageUpdateRequest } from "../../Types/request";
import ConversationHeader from "../../Components/Conversation/ConversationHeader";
import MessagesList from "../../Components/Conversation/MessagesList";
import MessageInput from "../../Components/Conversation/MessageInput";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

type ConversationNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "Conversation"
>;

const { width, height } = Dimensions.get("window");

const ConversationScreen = () => {
  const navigation = useNavigation<ConversationNavigationProp>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] =
    useState<ChatMessageResponse | null>(null);
  const [editText, setEditText] = useState("");
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));

  // Add WebSocket hooks
  const { isConnected, subscribe, unsubscribe } = useSocket();

  // Get params from navigation - safely handle them in case they're missing
  const params =
    (route.params as {
      conversationId: string;
      conversationName?: string;
      avatar?: any;
      receiverId?: string;
    }) || {};

  const conversationName = params.conversationName || "Placeholder";

  const { conversations } = useConversations();
  const {
    messages,
    isMessagesLoading,
    getChatMessagesByConversationId,
    addMessage,
    updateMessage,
    removeMessage,
    clearCurrentConversation,
  } = useChatMessages();
  const { isAuthenticated } = useAuth();

  // Get current conversation data
  const currentConversation = conversations.find(
    (conv) => conv.conversationId === params.conversationId
  );
  const conversationType = currentConversation?.conversationType || "DIRECT";

  // Compute avatar from conversation data
  const getConversationAvatar = () => {
    // If params has avatar as { uri: ... }, use it
    if (
      params.avatar &&
      typeof params.avatar === "object" &&
      "uri" in params.avatar
    ) {
      return params.avatar.uri;
    }

    // Otherwise, try to get from conversation data
    if (currentConversation) {
      // For direct conversations, get the other user's avatar
      if (
        conversationType === "DIRECT" &&
        currentConversation.userDetails &&
        currentUserDetail
      ) {
        const otherUser = currentConversation.userDetails.find(
          (user) => user.id !== currentUserDetail.id
        );
        if (otherUser?.avatar?.fileName && otherUser.id) {
          return getAvatarUrl(otherUser.id, otherUser.avatar.fileName);
        }
      }
      // For group conversations, use conversation avatar if available
      else if (
        currentConversation.avatar?.fileName &&
        currentConversation.conversationId
      ) {
        return getAvatarUrl(
          currentConversation.conversationId,
          currentConversation.avatar.fileName
        );
      }
    }

    return null;
  };

  const avatarUrl = getConversationAvatar();

  // Check if this is an AI conversation
  const isAiConversation =
    conversationName === "AI Assistant" ||
    params.conversationId === "ai-assistant";

  // Animation on component mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    if (isConnected && params.conversationId) {
      console.log(
        "🔔 Setting up WebSocket subscription for conversation:",
        params.conversationId
      );

      // Subscribe to user-specific chat queue
      subscribe("/user/queue/chat", (receivedMessage: ChatMessageResponse) => {
        console.log("📨 Received real-time chat message:", receivedMessage);

        // Skip WebSocket messages for AI conversations to prevent duplication
        // AI conversations are handled entirely by API responses
        if (isAiConversation) {
          console.log(
            "🤖 AI conversation detected, skipping WebSocket message to prevent duplication"
          );
          return;
        }

        // Only add message if it belongs to current conversation
        if (receivedMessage.conversationId === params.conversationId) {
          console.log(
            "✅ Message belongs to current conversation, adding to messages"
          );
          addMessage(receivedMessage);
        } else {
          console.log("ℹ️ Message belongs to different conversation, ignoring");
        }
      });

      // Cleanup subscription when component unmounts or conversation changes
      return () => {
        console.log(
          "🔕 Unsubscribing from WebSocket for conversation:",
          params.conversationId
        );
        unsubscribe("/user/queue/chat");
      };
    } else {
      console.log("⚠️ WebSocket not connected or no conversation ID");
    }
  }, [isConnected, params.conversationId, subscribe, unsubscribe, addMessage]);

  useEffect(() => {
    console.log("Conversation screen params:", params);
    console.log("ConversationId from params:", params.conversationId);
    console.log(
      "Available conversations:",
      conversations.map((c) => c.conversationId)
    );

    if (params.conversationId) {
      // Skip conversation check for AI conversations
      if (isAiConversation) {
        // AI conversations don't need to be in the conversation list
        console.log("AI conversation detected, fetching AI messages");
        getChatMessagesByConversationId(params.conversationId);
      } else {
        // Check if the conversation exists in the user's conversation list
        const conversationExists = conversations.some(
          (conv) => conv.conversationId === params.conversationId
        );

        if (conversationExists) {
          getChatMessagesByConversationId(params.conversationId);
        } else {
          console.error(
            "Conversation not found in user's conversation list:",
            params.conversationId
          );
          Alert.alert(
            "Error",
            "Conversation not found or you don't have access to it."
          );
          navigation.goBack();
        }
      }
    } else {
      console.error("No conversationId provided to Conversation screen");
      Alert.alert("Error", "No conversation selected.");
      navigation.goBack();
    }

    // Load current user details
    const loadCurrentUser = async () => {
      try {
        const response = await UserDetailService.getMyDetails();
        if (response.result) {
          setCurrentUserDetail(response.result);
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };

    if (isAuthenticated) {
      loadCurrentUser();
    }
  }, [params.conversationId, isAuthenticated]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("ConversationScreen: Cleaning up conversation");
      clearCurrentConversation();
    };
  }, []);

  // Send message using ChatMessageService
  const handleSend = async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    try {
      let response;

      // Check if this is an AI conversation
      if (isAiConversation) {
        // Send message to AI
        response = await ChatMessageService.createAiChatMessage(
          message.trim(),
          "AI"
        );
      } else if (params.conversationId) {
        console.log("ConversationId:", params.conversationId);
        conversations.forEach((conv) => {
          console.log(
            "Conversation:",
            conv.conversationId,
            conv.conversationType,
            conv.participantIds
          );
        });

        const conversation = conversations.find(
          (conv) => conv.conversationId === params.conversationId
        );
        if (
          !conversation ||
          !conversation.participantIds ||
          !currentUserDetail?.id
        ) {
          Alert.alert("Error", "Conversation data not available");
          return;
        }

        // Use appropriate method based on conversation type
        if (conversation.conversationType === "DIRECT") {
          response = await ChatMessageService.sendMessageToDirectConversation(
            params.conversationId,
            message.trim(),
            currentUserDetail.id,
            conversation.participantIds
          );
        } else if (conversation.conversationType === "GROUP") {
          response = await ChatMessageService.sendMessageToGroupConversation(
            params.conversationId, // Use conversationId as groupId for group messages
            message.trim()
          );
        } else {
          Alert.alert("Error", "Unknown conversation type");
          return;
        }
      } else if (params.receiverId) {
        // Send direct message
        response = await ChatMessageService.sendDirectMessage(
          params.receiverId,
          message.trim()
        );
      } else {
        Alert.alert("Error", "No conversation or receiver specified");
        return;
      }

      if (response.result) {
        // Add message to local state immediately for instant UI update
        addMessage(response.result);
        setMessage("");
        console.log("📤 Message sent:", response.result.message);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Edit message using ChatMessageService
  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    setIsLoading(true);
    try {
      const updateRequest: ChatMessageUpdateRequest = {
        message: newText.trim(),
      };

      const response = await ChatMessageService.updateChatMessage(
        messageId,
        updateRequest
      );

      if (response.result) {
        // Update local state using ConversationProvider
        updateMessage(messageId, response.result);
        console.log("✏️ Message updated");
        setEditingMessage(null);
        setEditText("");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      Alert.alert("Error", "Failed to update message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete message using ChatMessageService
  const handleDeleteMessage = async (messageId: string) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await ChatMessageService.deleteChatMessage(messageId);
              // Remove from local state using ConversationProvider
              removeMessage(messageId);
              console.log("🗑️ Message deleted");
            } catch (error) {
              console.error("Error deleting message:", error);
              Alert.alert(
                "Error",
                "Failed to delete message. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  // Start editing a message
  const startEditing = (message: ChatMessageResponse) => {
    setEditingMessage(message);
    setEditText(message.message);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingMessage(null);
    setEditText("");
  };

  // Save edit
  const saveEdit = () => {
    if (editingMessage && editText.trim()) {
      handleEditMessage(editingMessage.id, editText);
    }
  };

  // Navigation handlers
  const handleSearchPress = () => {
    navigation.navigate("MainTabs", {
      screen: "Inbox",
      params: {
        screen: "UserSearch",
        params: {},
      },
    } as any);
  };

  const handleOptionsPress = () => {
    navigation.navigate("ConversationOptions", {
      conversationId: params.conversationId,
      conversationName: conversationName,
      avatar: avatarUrl ? { uri: avatarUrl } : undefined,
      conversationType: conversationType,
    });
  };

  const handleBackPress = () => {
    navigation.goBack();
  };

  // Message bubble component with edit/delete functionality
  const renderMessageItem = ({ item }: { item: ChatMessageResponse }) => {
    const isEditing = editingMessage?.id === item.id;
    // Handle both API responses ("me") and WebSocket messages (user ID)
    const isMyMessage =
      item.sender === "me" || currentUserDetail?.id === item.sender;

    return (
      <View className={`mb-2 ${isMyMessage ? "items-end" : "items-start"}`}>
        {isEditing ? (
          // Edit mode
          <View className="px-3 py-2 bg-gray-100 rounded-xl">
            <TextInput
              value={editText}
              onChangeText={setEditText}
              className="bg-white rounded-lg px-2 py-1.5 mb-2 text-sm"
              multiline
              autoFocus
              maxLength={500}
            />
            <View className="flex-row justify-end space-x-1">
              <TouchableOpacity
                onPress={cancelEditing}
                className="px-2 py-1 bg-gray-300 rounded-md"
              >
                <Text className="text-gray-700 text-xs">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={saveEdit}
                className="px-2 py-1 bg-pink-600 rounded-md"
                disabled={!editText.trim()}
              >
                <Text className="text-white text-xs">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          // TikTok-style message display
          <View
            className={`px-4 py-3 max-w-[85%] ${
              isMyMessage
                ? "bg-black rounded-2xl rounded-br-sm"
                : "bg-gray-100 rounded-2xl rounded-bl-sm"
            }`}
            style={
              isMyMessage
                ? {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.15,
                    shadowRadius: 4,
                    elevation: 6,
                  }
                : {
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.05,
                    shadowRadius: 2,
                    elevation: 1,
                  }
            }
          >
            <Text
              className={`text-sm leading-5 ${isMyMessage ? "text-white font-medium" : "text-gray-900 font-medium"}`}
            >
              {item.message}
            </Text>
            <View className="flex-row justify-between items-center mt-2">
              <Text
                className={`text-xs ${isMyMessage ? "text-gray-300" : "text-gray-500"}`}
              >
                {new Date(item.createdAt as string).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              {/* TikTok-style Edit/Delete buttons for my messages */}
              {isMyMessage && (
                <View className="flex-row space-x-1">
                  <TouchableOpacity
                    onPress={() => startEditing(item)}
                    className="p-1.5 bg-white/20 rounded-full"
                    activeOpacity={0.6}
                  >
                    <Ionicons name="create-outline" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleDeleteMessage(item.id)}
                    className="p-1.5 bg-white/20 rounded-full"
                    activeOpacity={0.6}
                  >
                    <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      {/* Clean Background with subtle gradient */}
      <LinearGradient
        colors={["#fafafa", "#ffffff", "#f8fafc"]}
        className="absolute inset-0"
      />

      {/* Minimal decorative elements */}
      <View className="absolute top-20 right-8 w-16 h-16 bg-pink-100 rounded-full opacity-20" />
      <View className="absolute bottom-32 left-6 w-12 h-12 bg-blue-100 rounded-full opacity-15" />

      {/* Header */}
      <SafeAreaView edges={["top"]}>
        <ConversationHeader
          conversationName={conversationName}
          avatarUrl={avatarUrl}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          onBackPress={handleBackPress}
          onSearchPress={handleSearchPress}
          onOptionsPress={handleOptionsPress}
          isAiConversation={isAiConversation}
        />
      </SafeAreaView>

      {/* KeyboardAvoidingView wrapping both messages and input */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        {/* Messages List */}
        <View className="flex-1">
          <MessagesList
            messages={messages}
            isMessagesLoading={isMessagesLoading}
            editingMessage={editingMessage}
            editText={editText}
            currentUserDetail={currentUserDetail}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            onEditTextChange={setEditText}
            onStartEditing={startEditing}
            onCancelEditing={cancelEditing}
            onSaveEdit={saveEdit}
            onDeleteMessage={handleDeleteMessage}
            isLoading={isLoading}
            conversationName={conversationName}
          />
        </View>

        {/* Message Input */}
        <SafeAreaView edges={["bottom"]}>
          <MessageInput
            message={message}
            onMessageChange={setMessage}
            onSend={handleSend}
            editingMessage={editingMessage}
            editText={editText}
            onEditTextChange={setEditText}
            onCancelEditing={cancelEditing}
            onSaveEdit={saveEdit}
            isLoading={isLoading}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
          />
        </SafeAreaView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ConversationScreen;
