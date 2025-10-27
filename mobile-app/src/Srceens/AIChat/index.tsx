import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../Context/AuthProvider";
import { useChatMessages } from "../../Context/ChatMessageProvider";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import ChatMessageService from "../../Services/ChatMessageService";
import UserDetailService from "../../Services/UserDetailService";
import ConversationHeader from "../../Components/Conversation/ConversationHeader";
import MessagesList from "../../Components/Conversation/MessagesList";
import MessageInput from "../../Components/Conversation/MessageInput";

type AIChatNavigationProp = StackNavigationProp<AuthedStackParamList, "AIChat">;

const AIChatScreen = () => {
  const navigation = useNavigation<AIChatNavigationProp>();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [editingMessage, setEditingMessage] =
    useState<ChatMessageResponse | null>(null);
  const [editText, setEditText] = useState("");
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [aiConversationId, setAiConversationId] = useState<string | null>(null);

  const { isAuthenticated } = useAuth();
  const {
    messages,
    isMessagesLoading,
    getChatMessagesByConversationId,
    clearCurrentConversation,
  } = useChatMessages();

  const conversationName = "AI Assistant";
  const AI_USER_ID = "ai-system";
  const AI_CONVERSATION_STORAGE_KEY = "@ai_conversation_id";

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

  // Use global ChatMessageProvider for consistent message handling

  // Load current user and persisted conversation on mount
  useEffect(() => {
    const loadData = async () => {
      if (!isAuthenticated) return;

      try {
        // Load current user details
        const userResponse = await UserDetailService.getMyDetails();
        if (userResponse.result) {
          setCurrentUserDetail(userResponse.result);
        }

        // Get or create AI conversation using the dedicated endpoint
        try {
          console.log("🤖 Getting AI conversation...");
          const aiConversationResponse =
            await ChatMessageService.getAiConversation();

          if (aiConversationResponse.result) {
            const conversationId = aiConversationResponse.result.conversationId;
            setAiConversationId(conversationId);

            // Store conversation ID for future sessions
            await AsyncStorage.setItem(
              AI_CONVERSATION_STORAGE_KEY,
              conversationId
            );
            console.log("💾 Stored AI conversation ID:", conversationId);

            // Load messages for the conversation
            await getChatMessagesByConversationId(conversationId);
            console.log("✅ Successfully loaded AI conversation and messages");
          }
        } catch (error: any) {
          console.error("❌ Error getting AI conversation:", error);
          // Clear any stored conversation ID if there's an error
          await AsyncStorage.removeItem(AI_CONVERSATION_STORAGE_KEY);
          setAiConversationId(null);
          clearCurrentConversation();
        }
      } catch (error) {
        console.error("Error loading data:", error);
        // Clear any potentially corrupted state
        clearCurrentConversation();
      }
    };

    loadData();
  }, [isAuthenticated]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("AIChatScreen: Cleaning up conversation");
      clearCurrentConversation();
    };
  }, []);

  // Send message to AI via RESTful API
  const handleSend = async () => {
    if (!message.trim() || !currentUserDetail) return;

    const userMessageText = message.trim();
    setMessage(""); // Clear input immediately
    setIsLoading(true);

    try {
      console.log("📤 Sending message to AI:", userMessageText);
      const response = await ChatMessageService.createAiChatMessage(
        userMessageText,
        AI_USER_ID
      );

      if (response.result) {
        const conversationId = response.result.conversationId;

        // Update conversation ID if we don't have one yet
        if (!aiConversationId && conversationId) {
          setAiConversationId(conversationId);

          // Persist conversation ID for future sessions
          await AsyncStorage.setItem(
            AI_CONVERSATION_STORAGE_KEY,
            conversationId
          );
          console.log("💾 Stored AI conversation ID:", conversationId);

          // Load messages for the new conversation using global provider
          if (conversationId) {
            getChatMessagesByConversationId(conversationId);
          }
        } else if (aiConversationId) {
          // For existing conversations, messages will be received via WebSocket
          console.log(
            "✅ User message sent, AI response will come via WebSocket"
          );
        }
      }
    } catch (error) {
      console.error("Error sending message to AI:", error);
      Alert.alert("Error", "Failed to send message to AI. Please try again.");
      // Restore message text
      setMessage(userMessageText);
    } finally {
      setIsLoading(false);
    }
  };

  // Edit message
  const handleEditMessage = async (messageId: string, newText: string) => {
    if (!newText.trim()) return;

    setIsLoading(true);
    try {
      const response = await ChatMessageService.updateChatMessage(messageId, {
        message: newText.trim(),
      });

      if (response.result) {
        console.log("✏️ Message updated");
        setEditingMessage(null);
        setEditText("");
        // Message will be updated via WebSocket
      }
    } catch (error) {
      console.error("Error updating message:", error);
      Alert.alert("Error", "Failed to update message. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete message
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
              console.log("🗑️ Message deleted");
              // Message will be removed via WebSocket
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
  const handleBackPress = () => {
    navigation.goBack();
  };

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
    Alert.alert("AI Assistant Options", "Manage your AI conversation", [
      {
        text: "Clear Conversation",
        style: "destructive",
        onPress: async () => {
          Alert.alert(
            "Clear Conversation",
            "Are you sure you want to clear your AI conversation history? This cannot be undone.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Clear",
                style: "destructive",
                onPress: async () => {
                  try {
                    // Clear persisted conversation ID
                    await AsyncStorage.removeItem(AI_CONVERSATION_STORAGE_KEY);
                    setAiConversationId(null);
                    clearCurrentConversation();
                    console.log("🗑️ AI conversation cleared");
                    Alert.alert("Success", "AI conversation cleared");
                  } catch (error) {
                    console.error("Error clearing conversation:", error);
                    Alert.alert("Error", "Failed to clear conversation");
                  }
                },
              },
            ]
          );
        },
      },
      {
        text: "Debug: Clear Storage",
        onPress: async () => {
          try {
            await AsyncStorage.removeItem(AI_CONVERSATION_STORAGE_KEY);
            setAiConversationId(null);
            clearCurrentConversation();
            console.log("🗑️ Storage cleared for debugging");
            Alert.alert("Debug", "Storage cleared");
          } catch (error) {
            console.error("Error clearing storage:", error);
            Alert.alert("Error", "Failed to clear storage");
          }
        },
      },
      {
        text: "About",
        onPress: () => {
          Alert.alert(
            "AI Assistant",
            "This is your AI chat assistant powered by OpenAI. Ask me anything!",
            [{ text: "OK" }]
          );
        },
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <View className="flex-1 bg-white">
      {/* Clean Background with subtle gradient */}
      <LinearGradient
        colors={["#fafafa", "#ffffff", "#f8fafc"]}
        className="absolute inset-0"
      />

      {/* Minimal decorative elements with AI theme */}
      <View className="absolute top-20 right-8 w-16 h-16 bg-purple-100 rounded-full opacity-20" />
      <View className="absolute bottom-32 left-6 w-12 h-12 bg-indigo-100 rounded-full opacity-15" />

      {/* Header */}
      <SafeAreaView edges={["top"]}>
        <ConversationHeader
          conversationName={conversationName}
          avatarUrl={null}
          fadeAnim={fadeAnim}
          slideAnim={slideAnim}
          onBackPress={handleBackPress}
          onSearchPress={handleSearchPress}
          onOptionsPress={handleOptionsPress}
          isAiConversation={true}
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

export default AIChatScreen;
