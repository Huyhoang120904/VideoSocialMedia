import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useConversations } from "../../Context/ConversationProvider";
import { useChatMessages } from "../../Context/ChatMessageProvider";
import { useAuth } from "../../Context/AuthProvider";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import UserDetailService from "../../Services/UserDetailService";
import ConversationHeader from "../../Components/Conversation/ConversationHeader";
import MessagesList from "../../Components/Conversation/MessagesList";
import MessageInput from "../../Components/Conversation/MessageInput";
import ConversationBackground from "../../Components/Conversation/ConversationBackground";
import { useMediaPicker } from "../../Hooks/useMediaPicker";
import { useConversationMessages } from "../../Hooks/useConversationMessages";
import { useConversationWebSocket } from "../../Hooks/useConversationWebSocket";
import { useConversationAvatar } from "../../Hooks/useConversationAvatar";

type ConversationScreenRouteProp = RouteProp<
  AuthedStackParamList,
  "Conversation"
>;
type ConversationNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "Conversation"
>;

const ConversationScreen = () => {
  const navigation = useNavigation<ConversationNavigationProp>();
  const route = useRoute<ConversationScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const [message, setMessage] = useState("");
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(30));
  const [headerHeight, setHeaderHeight] = useState(0);
  const loadedConversationIdRef = useRef<string | null>(null);

  const params = route.params || {};
  const conversationId = params.conversationId;
  const conversationName = params.conversationName || "Placeholder";

  const { conversations } = useConversations();
  const {
    messages,
    isMessagesLoading,
    isLoadingMore,
    hasMoreMessages,
    getChatMessagesByConversationId,
    loadMoreMessages,
    addMessage,
    updateMessage,
    removeMessage,
    clearCurrentConversation,
  } = useChatMessages();
  const { isAuthenticated } = useAuth();

  const currentConversation = conversations.find(
    (conv) => conv.conversationId === conversationId
  );
  const conversationType = currentConversation?.conversationType || "DIRECT";
  const isAiConversation =
    conversationName === "AI Assistant" || conversationId === "ai-assistant";

  const {
    handleImagePick,
    handleVideoPick,
    isLoading: isMediaLoading,
  } = useMediaPicker({
    conversationId: conversationId || "",
    onMessageAdded: addMessage,
  });

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
  } = useConversationMessages({
    conversationId: conversationId || "",
    receiverId: params.receiverId,
    conversations,
    currentUserDetail,
    onMessageAdded: addMessage,
    onMessageUpdated: updateMessage,
    onMessageRemoved: removeMessage,
  });

  const avatarUrl = useConversationAvatar({
    params,
    currentConversation,
    currentUserDetail,
    conversationType,
  });

  console.log(`conversationId : `, conversationId);

  useConversationWebSocket({
    conversationId: conversationId || "",
    isAiConversation,
    onMessageReceived: addMessage,
  });

  const isLoading = isMediaLoading || isMessageLoading;

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
  }, [fadeAnim, slideAnim]);

  useEffect(() => {
    if (!conversationId) {
      Alert.alert("Error", "No conversation selected.");
      navigation.goBack();
      return;
    }

    // Prevent loading the same conversation multiple times
    if (loadedConversationIdRef.current === conversationId) {
      return;
    }

    if (isAiConversation) {
      loadedConversationIdRef.current = conversationId;
      getChatMessagesByConversationId(conversationId);
    } else {
      const conversationExists = conversations.some(
        (conv) => conv.conversationId === conversationId
      );

      if (conversationExists) {
        loadedConversationIdRef.current = conversationId;
        getChatMessagesByConversationId(conversationId);
      } else {
        Alert.alert(
          "Error",
          "Conversation not found or you don't have access to it."
        );
        navigation.goBack();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isAiConversation]);

  useEffect(() => {
    if (!isAuthenticated) return;

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

    loadCurrentUser();
  }, [isAuthenticated]);

  useEffect(() => {
    return () => {
      loadedConversationIdRef.current = null;
      clearCurrentConversation();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchPress = useCallback(() => {
    const parentNavigation =
      navigation.getParent<StackNavigationProp<AuthedStackParamList>>();
    if (parentNavigation) {
      parentNavigation.navigate("MainTabs", {
        screen: "Inbox",
        params: {
          screen: "UserSearch",
          params: {},
        },
      });
    }
  }, [navigation]);

  const handleOptionsPress = useCallback(() => {
    if (!conversationId) return;

    navigation.navigate("ConversationOptions", {
      conversationId,
      conversationName,
      avatar: avatarUrl ? { uri: avatarUrl } : undefined,
      conversationType,
    });
  }, [
    navigation,
    conversationId,
    conversationName,
    avatarUrl,
    conversationType,
  ]);

  const handleBackPress = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return;
    await handleSend(message);
    setMessage("");
  }, [message, handleSend]);

  return (
    <View className="flex-1 bg-white">
      <ConversationBackground />

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
            avatarUrl={avatarUrl}
            fadeAnim={fadeAnim}
            slideAnim={slideAnim}
            onBackPress={handleBackPress}
            onSearchPress={handleSearchPress}
            onOptionsPress={handleOptionsPress}
            isAiConversation={isAiConversation}
          />
        </SafeAreaView>
      </View>

      <View style={{ height: headerHeight }} />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.select({ ios: "padding", android: "height" })}
        keyboardVerticalOffset={Platform.select({
          ios: headerHeight || insets.top + 60,
          android: (headerHeight || insets.top + 60) + insets.bottom,
        })}
        enabled
      >
        <View className="flex-1">
          <MessagesList
            messages={messages}
            isMessagesLoading={isMessagesLoading}
            isLoadingMore={isLoadingMore}
            hasMoreMessages={hasMoreMessages}
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
            onLoadMore={loadMoreMessages}
            isLoading={isLoading}
            conversationName={conversationName}
            isAiConversation={isAiConversation}
          />
        </View>

        <SafeAreaView edges={["bottom"]}>
          <MessageInput
            message={message}
            onMessageChange={setMessage}
            onSend={handleSendMessage}
            onImagePick={handleImagePick}
            onVideoPick={handleVideoPick}
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
