import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useConversations } from "../../Context/ConversationProvider";
import { useAuth } from "../../Context/AuthProvider";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { ConversationResponse } from "../../Types/response/ConversationResponse";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import ConversationService from "../../Services/ConversationService";
import UserDetailService from "../../Services/UserDetailService";

type ConversationOptionsNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "ConversationOptions"
>;

interface ConversationOptionsRouteParams {
  conversationId: string;
  conversationName?: string;
  avatar?: any;
  conversationType?: string;
}

const ConversationOptionsScreen = () => {
  const navigation = useNavigation<ConversationOptionsNavigationProp>();
  const route = useRoute();
  const { conversations, refreshConversations } = useConversations();
  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [updateName, setUpdateName] = useState("");
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);

  // Get params from navigation
  const params = route.params as ConversationOptionsRouteParams;
  const conversationId = params.conversationId;
  const conversationName = params.conversationName || "Conversation";
  const avatar = params.avatar || require("../../../assets/avatar.png");
  const conversationType = params.conversationType || "DIRECT";

  // Get current conversation data
  const currentConversation = conversations.find(
    (conv) => conv.conversationId === conversationId
  );

  useEffect(() => {
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
  }, [isAuthenticated]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleViewProfile = () => {
    if (conversationType === "DIRECT" && currentConversation?.userDetails) {
      const otherUser = currentConversation.userDetails.find(
        (user) => user.id !== currentUserDetail?.id
      );
      if (otherUser) {
        navigation.navigate("UserProfile", {
          userId: otherUser.id,
          userDisplayName: otherUser.displayName,
        });
      }
    } else {
      Alert.alert(
        "Profile",
        "Profile viewing not available for group conversations"
      );
    }
  };

  const handleAddMember = () => {
    navigation.navigate("MainTabs", {
      screen: "Inbox",
      params: {
        screen: "UserSearch",
        params: {
          mode: "addMember",
          conversationId: conversationId,
        },
      },
    } as any);
  };

  const handleViewMembers = () => {
    if (conversationType === "GROUP") {
      navigation.navigate("ConversationMembers", {
        conversationId: conversationId,
        conversationName:
          currentConversation?.conversationName || conversationName,
      });
    } else {
      Alert.alert(
        "Members",
        "Members viewing not available for direct conversations"
      );
    }
  };

  const handleRemoveMember = () => {
    if (conversationType === "GROUP" && currentConversation?.userDetails) {
      const members = currentConversation.userDetails.filter(
        (user) => user.id !== currentUserDetail?.id
      );

      if (members.length === 0) {
        Alert.alert("No Members", "No other members to remove");
        return;
      }

      Alert.alert("Remove Member", "Select a member to remove:", [
        ...members.map((member) => ({
          text: member.displayName || "Unknown User",
          onPress: () =>
            confirmRemoveMember(
              member.id,
              member.displayName || "Unknown User"
            ),
        })),
        { text: "Cancel", style: "cancel" },
      ]);
    } else {
      Alert.alert(
        "Remove Member",
        "Member removal not available for direct conversations"
      );
    }
  };

  const confirmRemoveMember = async (memberId: string, memberName: string) => {
    Alert.alert(
      "Confirm Removal",
      `Are you sure you want to remove ${memberName} from this conversation?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await ConversationService.removeMemberFromConversation(
                conversationId,
                memberId
              );
              await refreshConversations();
              Alert.alert(
                "Success",
                `${memberName} has been removed from the conversation`
              );
            } catch (error) {
              console.error("Error removing member:", error);
              Alert.alert(
                "Error",
                "Failed to remove member. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleUpdateConversation = () => {
    setUpdateName(currentConversation?.conversationName || "");
    setShowUpdateForm(true);
  };

  const handleSaveUpdate = async () => {
    if (!updateName.trim()) {
      Alert.alert("Error", "Conversation name cannot be empty");
      return;
    }

    setIsUpdating(true);
    try {
      await ConversationService.updateConversation(conversationId, {
        conversationName: updateName.trim(),
        participantIds: currentConversation?.participantIds || [],
        conversationType:
          (currentConversation?.conversationType as "DIRECT" | "GROUP") ||
          "DIRECT",
      });
      await refreshConversations();
      setShowUpdateForm(false);
      Alert.alert("Success", "Conversation updated successfully");
    } catch (error) {
      console.error("Error updating conversation:", error);
      Alert.alert("Error", "Failed to update conversation. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteConversation = () => {
    const conversationTypeText =
      conversationType === "GROUP" ? "group" : "chat";

    Alert.alert(
      "Delete Conversation",
      `Are you sure you want to delete this ${conversationTypeText}? This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setIsLoading(true);
            try {
              await ConversationService.deleteConversation(conversationId);
              await refreshConversations();
              Alert.alert(
                "Success",
                `The ${conversationTypeText} has been deleted`
              );
              navigation.goBack();
            } catch (error) {
              console.error("Error deleting conversation:", error);
              Alert.alert(
                "Error",
                "Failed to delete conversation. Please try again."
              );
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleVideoCall = () => {
    if (conversationType === "DIRECT" && currentConversation?.userDetails) {
      const otherUser = currentConversation.userDetails.find(
        (user) => user.id !== currentUserDetail?.id
      );
      if (otherUser) {
        navigation.navigate("Call", {
          callType: "video",
          userId: otherUser.id,
          userName: otherUser.displayName || "Unknown User",
          userAvatar: otherUser.avatar?.url,
        });
      }
    } else {
      Alert.alert(
        "Video Call",
        "Video calling not available for group conversations"
      );
    }
  };

  const handleVoiceCall = () => {
    if (conversationType === "DIRECT" && currentConversation?.userDetails) {
      const otherUser = currentConversation.userDetails.find(
        (user) => user.id !== currentUserDetail?.id
      );
      if (otherUser) {
        navigation.navigate("Call", {
          callType: "voice",
          userId: otherUser.id,
          userName: otherUser.displayName || "Unknown User",
          userAvatar: otherUser.avatar?.url,
        });
      }
    } else {
      Alert.alert(
        "Voice Call",
        "Voice calling not available for group conversations"
      );
    }
  };

  const renderOptionButton = (
    icon: string,
    title: string,
    subtitle: string,
    onPress: () => void,
    color: string = "#3B82F6",
    isDestructive: boolean = false
  ) => (
    <TouchableOpacity
      className="flex-row items-center py-4 px-4 rounded-2xl bg-gray-50 mb-3"
      onPress={onPress}
      activeOpacity={0.7}
      disabled={isLoading}
    >
      <View
        className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
          isDestructive ? "bg-red-100" : "bg-gray-100"
        }`}
      >
        <Ionicons
          name={icon as any}
          size={24}
          color={isDestructive ? "#EF4444" : color}
        />
      </View>
      <View className="flex-1">
        <Text
          className={`text-base font-semibold ${
            isDestructive ? "text-red-600" : "text-gray-900"
          }`}
        >
          {title}
        </Text>
        <Text className="text-sm text-gray-500 mt-1">{subtitle}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
    </TouchableOpacity>
  );

  if (showUpdateForm) {
    return (
      <View className="flex-1 bg-white">
        <SafeAreaView className="flex-1">
          <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
            <TouchableOpacity onPress={() => setShowUpdateForm(false)}>
              <Ionicons name="close" size={24} color="#374151" />
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-gray-900">
              Update Conversation
            </Text>
            <TouchableOpacity
              onPress={handleSaveUpdate}
              disabled={isUpdating || !updateName.trim()}
            >
              <Text
                className={`text-base font-semibold ${
                  isUpdating || !updateName.trim()
                    ? "text-gray-400"
                    : "text-pink-600"
                }`}
              >
                {isUpdating ? "Saving..." : "Save"}
              </Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 px-6 pt-6">
            <Text className="text-base font-medium text-gray-700 mb-3">
              Conversation Name
            </Text>
            <TextInput
              value={updateName}
              onChangeText={setUpdateName}
              placeholder="Enter conversation name"
              className="bg-gray-50 rounded-xl px-4 py-4 text-base border border-gray-200"
              maxLength={50}
              autoFocus
            />
            <Text className="text-sm text-gray-500 mt-2">
              {updateName.length}/50 characters
            </Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-white">
      <LinearGradient
        colors={["#fafafa", "#ffffff", "#f8fafc"]}
        className="absolute inset-0"
      />

      <SafeAreaView className="flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between px-6 py-4 border-b border-gray-200">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <Text className="text-lg font-semibold text-gray-900">
            {conversationType === "GROUP" ? "Group Options" : "Chat Options"}
          </Text>
          <View className="w-6" />
        </View>

        {/* Conversation Info */}
        <View className="px-6 py-6 border-b border-gray-200">
          <View className="flex-row items-center">
            <Image
              source={avatar}
              className="w-16 h-16 rounded-full mr-4"
              resizeMode="cover"
            />
            <View className="flex-1">
              <Text className="text-xl font-bold text-gray-900">
                {currentConversation?.conversationName || conversationName}
              </Text>
              <Text className="text-sm text-gray-500 mt-1">
                {conversationType === "GROUP"
                  ? `${currentConversation?.userDetails?.length || 0} members`
                  : "Direct message"}
              </Text>
            </View>
          </View>
        </View>

        {/* Options */}
        <ScrollView className="flex-1 px-6 pt-6">
          {/* View Profile - Only for direct conversations */}
          {conversationType === "DIRECT" &&
            renderOptionButton(
              "person-outline",
              "View Profile",
              "View user's profile and details",
              handleViewProfile,
              "#EC4899"
            )}

          {/* Direct conversation specific options */}
          {conversationType === "DIRECT" && (
            <>
              {renderOptionButton(
                "videocam-outline",
                "Video Call",
                "Start a video call",
                handleVideoCall,
                "#10B981"
              )}
              {renderOptionButton(
                "call-outline",
                "Voice Call",
                "Start a voice call",
                handleVoiceCall,
                "#3B82F6"
              )}
            </>
          )}

          {/* Group-specific options */}
          {conversationType === "GROUP" && (
            <>
              {renderOptionButton(
                "person-add-outline",
                "Add Member",
                "Add new members to the group",
                handleAddMember,
                "#3B82F6"
              )}
              {renderOptionButton(
                "people-outline",
                "View Members",
                "See all group members",
                handleViewMembers,
                "#8B5CF6"
              )}
              {renderOptionButton(
                "person-remove-outline",
                "Remove Member",
                "Remove members from the group",
                handleRemoveMember,
                "#F59E0B"
              )}
            </>
          )}

          {/* Update conversation */}
          {renderOptionButton(
            "create-outline",
            conversationType === "GROUP" ? "Update Group" : "Update Chat",
            "Change name and settings",
            handleUpdateConversation,
            "#8B5CF6"
          )}

          {/* Delete conversation */}
          {renderOptionButton(
            "trash-outline",
            conversationType === "GROUP" ? "Delete Group" : "Delete Chat",
            "Permanently delete this conversation",
            handleDeleteConversation,
            "#EF4444",
            true
          )}
        </ScrollView>

        {/* Loading Overlay */}
        {isLoading && (
          <View className="absolute inset-0 bg-black/20 items-center justify-center">
            <View className="bg-white rounded-2xl p-6 items-center">
              <ActivityIndicator size="large" color="#EC4899" />
              <Text className="text-gray-700 font-medium mt-3">
                Processing...
              </Text>
            </View>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
};

export default ConversationOptionsScreen;
