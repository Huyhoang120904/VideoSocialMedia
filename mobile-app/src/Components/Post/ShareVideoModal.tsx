import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useConversations } from "../../Context/ConversationProvider";
import { ConversationResponse } from "../../Types/response/ConversationResponse";
import { useAuth } from "../../Context/AuthProvider";
import UserDetailService from "../../Services/UserDetailService";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";
import ChatMessageService from "../../Services/ChatMessageService";
import { ChatMessageType } from "../../Types/common/ChatMessageType";

interface ShareVideoModalProps {
  visible: boolean;
  onClose: () => void;
  feedItemId: string;
  feedItemTitle?: string;
}

export default function ShareVideoModal({
  visible,
  onClose,
  feedItemId,
  feedItemTitle,
}: ShareVideoModalProps) {
  const { conversations, isLoading } = useConversations();
  const { isAuthenticated } = useAuth();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [sendingToConversationId, setSendingToConversationId] = useState<
    string | null
  >(null);

  useEffect(() => {
    if (isAuthenticated && !currentUserId) {
      const fetchCurrentUser = async () => {
        try {
          const response = await UserDetailService.getMyDetails();
          if (response.result) {
            setCurrentUserId(response.result.id);
          }
        } catch (error) {
          console.error("Error fetching current user:", error);
        }
      };
      fetchCurrentUser();
    }
  }, [isAuthenticated, currentUserId]);

  const handleShareToConversation = async (
    conversation: ConversationResponse
  ) => {
    if (!currentUserId) {
      Alert.alert("Error", "User information not available");
      return;
    }

    setSendingToConversationId(conversation.conversationId);

    try {
      // Determine if it's a direct or group conversation
      if (conversation.conversationType === "DIRECT") {
        // Find the other participant
        const otherParticipant = conversation.participantIds?.find(
          (id) => id !== currentUserId
        );

        if (!otherParticipant) {
          Alert.alert("Error", "Could not find conversation participant");
          return;
        }

        // Send shared video message to direct conversation
        await ChatMessageService.sendSharedVideoToDirectConversation(
          otherParticipant,
          feedItemId,
          feedItemTitle
        );
      } else if (conversation.conversationType === "GROUP") {
        // Send shared video message to group conversation
        await ChatMessageService.sendSharedVideoToGroupConversation(
          conversation.conversationId,
          feedItemId,
          feedItemTitle
        );
      }

      Alert.alert("Success", "Video shared successfully!", [
        { text: "OK", onPress: onClose },
      ]);
    } catch (error: any) {
      console.error("Error sharing video:", error);
      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to share video. Please try again."
      );
    } finally {
      setSendingToConversationId(null);
    }
  };

  const getConversationName = (conversation: ConversationResponse) => {
    if (conversation.conversationName) {
      return conversation.conversationName;
    }

    if (
      conversation.conversationType === "DIRECT" &&
      conversation.userDetails
    ) {
      const otherUser = conversation.userDetails.find(
        (user) => user.id !== currentUserId
      );
      return (
        otherUser?.displayName ||
        otherUser?.shownName ||
        otherUser?.user?.username ||
        "Unknown User"
      );
    }

    return "Group Chat";
  };

  const getConversationAvatar = (conversation: ConversationResponse) => {
    if (conversation.avatar?.fileName && conversation.conversationId) {
      return getAvatarUrl(
        conversation.conversationId,
        conversation.avatar.fileName
      );
    }

    if (
      conversation.conversationType === "DIRECT" &&
      conversation.userDetails
    ) {
      const otherUser = conversation.userDetails.find(
        (user) => user.id !== currentUserId
      );
      if (otherUser?.avatar?.fileName && otherUser.id) {
        return getAvatarUrl(otherUser.id, otherUser.avatar.fileName);
      }
    }

    return null;
  };

  const renderConversationItem = ({ item }: { item: ConversationResponse }) => {
    const isSending = sendingToConversationId === item.conversationId;
    const avatarUrl = getConversationAvatar(item);
    const conversationName = getConversationName(item);

    return (
      <TouchableOpacity
        onPress={() => handleShareToConversation(item)}
        disabled={isSending}
        className="flex-row items-center p-4 bg-white border-b border-gray-100"
        activeOpacity={0.7}
      >
        {avatarUrl ? (
          <Image
            source={{ uri: avatarUrl }}
            className="w-12 h-12 rounded-full mr-3"
            style={{ backgroundColor: "#f3f4f6" }}
          />
        ) : (
          <View className="w-12 h-12 rounded-full mr-3 bg-gray-200 items-center justify-center">
            <Ionicons name="person" size={24} color="#9ca3af" />
          </View>
        )}

        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {conversationName}
          </Text>
          {item.conversationType === "GROUP" && (
            <Text className="text-sm text-gray-500 mt-1">
              {item.participantIds?.length || 0} members
            </Text>
          )}
        </View>

        {isSending ? (
          <ActivityIndicator size="small" color="#EC4899" />
        ) : (
          <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-end">
        <TouchableOpacity
          className="flex-1"
          activeOpacity={1}
          onPress={onClose}
        />
        <View className="bg-white rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
            <Text className="text-xl font-bold text-gray-900">Share Video</Text>
            <TouchableOpacity onPress={onClose} className="p-2">
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          {/* Conversations List */}
          {isLoading ? (
            <View className="py-20 items-center">
              <ActivityIndicator size="large" color="#EC4899" />
              <Text className="text-gray-500 mt-4">
                Loading conversations...
              </Text>
            </View>
          ) : conversations.length === 0 ? (
            <View className="py-20 items-center px-4">
              <Ionicons name="chatbubbles-outline" size={48} color="#d1d5db" />
              <Text className="text-gray-500 text-center mt-4 text-base">
                No conversations yet
              </Text>
              <Text className="text-gray-400 text-center mt-2 text-sm">
                Start a conversation to share videos
              </Text>
            </View>
          ) : (
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.conversationId}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}
