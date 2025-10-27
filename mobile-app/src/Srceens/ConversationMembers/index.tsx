import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
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
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import ConversationService from "../../Services/ConversationService";
import UserDetailService from "../../Services/UserDetailService";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

type ConversationMembersNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "ConversationMembers"
>;

interface ConversationMembersRouteParams {
  conversationId: string;
  conversationName?: string;
}

const ConversationMembersScreen = () => {
  const navigation = useNavigation<ConversationMembersNavigationProp>();
  const route = useRoute();
  const { conversations, refreshConversations } = useConversations();
  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(false);
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);

  // Get params from navigation
  const params = route.params as ConversationMembersRouteParams;
  const conversationId = params.conversationId;
  const conversationName = params.conversationName || "Group";

  // Get current conversation data
  const currentConversation = conversations.find(
    (conv) => conv.conversationId === conversationId
  );

  const members = currentConversation?.userDetails || [];

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

  const handleRemoveMember = (member: UserDetailResponse) => {
    if (member.id === currentUserDetail?.id) {
      Alert.alert("Cannot Remove", "You cannot remove yourself from the group");
      return;
    }

    Alert.alert(
      "Remove Member",
      `Are you sure you want to remove ${member.displayName} from this group?`,
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
                member.id
              );
              await refreshConversations();
              Alert.alert(
                "Success",
                `${member.displayName} has been removed from the group`
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

  const handleViewProfile = (member: UserDetailResponse) => {
    if (member.id === currentUserDetail?.id) {
      Alert.alert("Profile", "This is your profile");
      return;
    }

    navigation.navigate("UserProfile", {
      userDetailId: member.id,
      userDisplayName: member.displayName,
    });
  };

  const renderMemberItem = (member: UserDetailResponse) => {
    const isCurrentUser = member.id === currentUserDetail?.id;

    return (
      <View
        key={member.id}
        className="flex-row items-center py-4 px-4 bg-white rounded-2xl mb-3 shadow-sm border border-gray-100"
      >
        {(() => {
          const avatarUrl =
            member.avatar?.fileName && member.id
              ? getAvatarUrl(member.id, member.avatar.fileName)
              : null;
          return (
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("../../../assets/avatar.png")
              }
              className="w-12 h-12 rounded-full mr-4"
              resizeMode="cover"
            />
          );
        })()}

        <View className="flex-1">
          <Text className="text-base font-semibold text-gray-900">
            {member.displayName}
            {isCurrentUser && " (You)"}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">@{member.username}</Text>
        </View>

        <View className="flex-row items-center space-x-2">
          <TouchableOpacity
            onPress={() => handleViewProfile(member)}
            className="p-2 bg-gray-100 rounded-full"
            activeOpacity={0.7}
          >
            <Ionicons name="person-outline" size={20} color="#6B7280" />
          </TouchableOpacity>

          {!isCurrentUser && (
            <TouchableOpacity
              onPress={() => handleRemoveMember(member)}
              className="p-2 bg-red-100 rounded-full"
              activeOpacity={0.7}
            >
              <Ionicons
                name="person-remove-outline"
                size={20}
                color="#EF4444"
              />
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

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
            Group Members
          </Text>
          <View className="w-6" />
        </View>

        {/* Group Info */}
        <View className="px-6 py-4 border-b border-gray-200">
          <Text className="text-xl font-bold text-gray-900">
            {currentConversation?.conversationName || conversationName}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            {members.length} member{members.length !== 1 ? "s" : ""}
          </Text>
        </View>

        {/* Members List */}
        <ScrollView className="flex-1 px-6 pt-4">
          {members.length === 0 ? (
            <View className="flex-1 items-center justify-center py-20">
              <Ionicons name="people-outline" size={64} color="#D1D5DB" />
              <Text className="text-gray-500 text-lg font-medium mt-4">
                No members found
              </Text>
              <Text className="text-gray-400 text-sm mt-2 text-center">
                This group doesn't have any members yet
              </Text>
            </View>
          ) : (
            members.map(renderMemberItem)
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

export default ConversationMembersScreen;
