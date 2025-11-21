import React, { useEffect, useState } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../Context/AuthProvider";
import { useChatMessages } from "../../Context/ChatMessageProvider";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import UserDetailService from "../../Services/UserDetailService";
import ConversationHeader from "../../Components/Conversation/ConversationHeader";
import AIChatMessagesList from "../../Components/AIChat/MessagesList";
import MessageInput from "../../Components/Conversation/MessageInput";
import ConversationBackground from "../../Components/Conversation/ConversationBackground";
import { useAIConversation } from "../../Hooks/useAIConversation";
import { useAiConversationMessages } from "../../Hooks/useAiConversationMessages";
import { useConversationWebSocket } from "../../Hooks/useConversationWebSocket";

type AIChatNavigationProp = StackNavigationProp<AuthedStackParamList, "AIChat">;

const AIChatScreen = () => {
  const navigation = useNavigation<AIChatNavigationProp>();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [headerHeight, setHeaderHeight] = useState(0);

  const { isAuthenticated } = useAuth();
  const {
    messages,
    isMessagesLoading,
    getChatMessagesByConversationId,
    addMessage,
    updateMessage,
    removeMessage,
    clearCurrentConversation,
  } = useChatMessages();

  const conversationName = "AI Assistant";
  const isAiConversation = true;

  // Use ref to track messages for duplicate detection (avoids stale closure)
  const messagesRef = React.useRef(messages);
  React.useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load AI conversation
  const { aiConversationId, updateConversationId, clearConversation } =
    useAIConversation({
      isAuthenticated,
      onConversationLoaded: (conversationId) => {
        getChatMessagesByConversationId(conversationId);
      },
      onError: () => {
        clearCurrentConversation();
      },
    });

  // Use AI-specific message handling hook
  const {
    isLoading: isMessageLoading,
    editingMessage,
    editText,
    setEditText,
    handleSend,
    handleDeleteMessage,
    startEditing,
    cancelEditing,
    saveEdit,
  } = useAiConversationMessages({
    conversationId: aiConversationId || "",
    currentUserDetail,
    onMessageAdded: (newMessage) => {
      // Check if this message already exists by ID (ChatMessageProvider already does this)
      // But also check by content for user messages to catch optimistic duplicates
      const isUserMessage =
        newMessage.sender === "me" ||
        newMessage.senderId === currentUserDetail?.id;

      if (isUserMessage) {
        // For user messages, check if we have one with same content (optimistic or real)
        // Use ref to get current messages (avoid stale closure)
        const duplicateMessage = messagesRef.current.find(
          (msg) =>
            msg.message === newMessage.message &&
            (msg.sender === "me" ||
              msg.senderId === currentUserDetail?.id ||
              (msg.senderId === newMessage.senderId &&
                newMessage.senderId === currentUserDetail?.id))
        );

        if (duplicateMessage) {
          if (duplicateMessage.id.startsWith("temp-")) {
            // Replace optimistic with real message
            console.log(
              "🔄 Replacing optimistic message from API:",
              duplicateMessage.id,
              "->",
              newMessage.id
            );
            updateMessage(duplicateMessage.id, newMessage);
          } else {
            // Already have real message, skip
            console.log("⏭️ Duplicate user message, skipping:", newMessage.id);
          }
          // Update conversation ID even if we skip the message
          if (newMessage.conversationId && !aiConversationId) {
            updateConversationId(newMessage.conversationId);
            // Don't reload messages here - we already have them via optimistic/WebSocket
          }
          return;
        }
      }

      // No duplicate found, add the message
      addMessage(newMessage);

      // Update conversation ID if we got one from the message
      // Only reload messages if we don't have a conversation ID yet
      if (newMessage.conversationId && !aiConversationId) {
        updateConversationId(newMessage.conversationId);
        // Don't reload messages - we're already receiving them via optimistic/API/WebSocket
        // getChatMessagesByConversationId(newMessage.conversationId);
      }
    },
    onMessageUpdated: updateMessage,
    onMessageRemoved: removeMessage,
  });

  // Handle WebSocket messages - check for duplicates with optimistic messages
  const handleWebSocketMessage = (newMessage: ChatMessageResponse) => {
    // Check if this is a user message
    const isUserMessage =
      newMessage.sender === "me" ||
      newMessage.senderId === currentUserDetail?.id;

    if (isUserMessage) {
      // Check if we already have this message (by content and sender)
      // Use ref to get current messages (avoid stale closure)
      const existingMessage = messagesRef.current.find((msg) => {
        const sameContent = msg.message === newMessage.message;
        const sameSender =
          msg.sender === "me" ||
          msg.senderId === currentUserDetail?.id ||
          (msg.senderId === newMessage.senderId &&
            newMessage.senderId === currentUserDetail?.id);

        return sameContent && sameSender;
      });

      if (existingMessage) {
        // We already have this message (either optimistic or real)
        if (existingMessage.id.startsWith("temp-")) {
          // Replace optimistic message with real one
          console.log(
            "🔄 Replacing optimistic message from WebSocket:",
            existingMessage.id,
            "->",
            newMessage.id
          );
          updateMessage(existingMessage.id, newMessage);
        } else {
          // Already have the real message, skip
          console.log(
            "⏭️ Duplicate message from WebSocket, skipping:",
            newMessage.id
          );
        }
        return; // Don't add the message
      }
    }

    // Regular message (AI response or new user message), add it
    addMessage(newMessage);
  };

  // WebSocket subscription (AI conversations skip WebSocket to prevent duplication)
  useConversationWebSocket({
    conversationId: aiConversationId || "",
    isAiConversation: true,
    onMessageReceived: handleWebSocketMessage,
  });

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

  // Load current user details
  useEffect(() => {
    const loadCurrentUser = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await UserDetailService.getMyDetails();
        if (response.result) {
          setCurrentUserDetail(response.result);
        }
      } catch (error) {
        console.error("Error loading current user:", error);
      }
    };

    loadCurrentUser();
  }, [isAuthenticated]);

  // Cleanup when component unmounts
  useEffect(() => {
    return () => {
      console.log("AIChatScreen: Cleaning up conversation");
      clearCurrentConversation();
    };
  }, []);

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
                    await clearConversation();
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

  const handleSendMessage = async () => {
    if (!message.trim() || !aiConversationId) {
      // If no conversation ID yet, the message will create one
      await handleSend(message);
    } else {
      await handleSend(message);
    }
    setMessage("");
  };

  const isLoading = isMessageLoading;

  return (
    <View className="flex-1 bg-white">
      <ConversationBackground />

      {/* Header - Fixed at top */}
      <View
        pointerEvents="box-none"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 30,
          elevation: 30,
        }}
      >
        <SafeAreaView
          edges={["top"]}
          onLayout={(event) => {
            setHeaderHeight(event.nativeEvent.layout.height);
          }}
          style={{
            backgroundColor: "white",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.12,
            shadowRadius: 8,
            elevation: 30,
          }}
        >
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
      </View>

      <View style={{ height: headerHeight }} />

      {/* KeyboardAvoidingView wrapping only messages and input */}
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({
          ios: headerHeight || insets.top + 60,
          android: (headerHeight || insets.top + 60) + insets.bottom,
        })}
        enabled
      >
        {/* Messages List */}
        <View className="flex-1">
          <AIChatMessagesList
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
            onSend={handleSendMessage}
            onImagePick={async () => {
              Alert.alert(
                "Info",
                "Image attachments are not available for AI conversations."
              );
            }}
            onVideoPick={async () => {
              Alert.alert(
                "Info",
                "Video attachments are not available for AI conversations."
              );
            }}
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
