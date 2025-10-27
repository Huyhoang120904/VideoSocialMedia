import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { UserResponse } from "../../Types/response/UserResponse";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import {
  InboxStackParamList,
  AuthedStackParamList,
} from "../../Types/response/navigation.types";
import UserDetailService from "../../Services/UserDetailService";
import ConversationService from "../../Services/ConversationService";
import { ConversationRequest } from "../../Types/request/ConversationRequest";
import { useConversations } from "../../Context/ConversationProvider";
import UserItem, { UserItemData } from "../../Components/UserItem";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

// Using UserItemData from the UserItem component
type UserSearchResult = UserItemData;

type UserSearchNavigationProp = StackNavigationProp<
  InboxStackParamList,
  "UserSearch"
>;

const UserSearchScreen = () => {
  const navigation = useNavigation<UserSearchNavigationProp>();
  const route = useRoute();
  const { getMyConversations, addConversation, refreshConversations } =
    useConversations();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<UserSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);

  // Get route parameters
  const params =
    (route.params as { mode?: string; conversationId?: string }) || {};
  const isAddMemberMode = params.mode === "addMember";
  const conversationId = params.conversationId;

  // Helper function to map UserDetailResponse to UserSearchResult
  const mapUserDetailToSearchResult = (
    userDetail: UserDetailResponse
  ): UserSearchResult => {
    const avatarUrl =
      userDetail.avatar?.fileName && userDetail.id
        ? getAvatarUrl(userDetail.id, userDetail.avatar.fileName)
        : null;

    return {
      id: userDetail.id,
      displayName:
        userDetail.displayName || userDetail.shownName || "Unknown User",
      username: userDetail.shownName || userDetail.displayName,
      bio: userDetail.bio,
      avatar: avatarUrl ? { url: avatarUrl } : undefined,
      isOnline: Math.random() > 0.5, // Placeholder for online status - replace with real data if available
    };
  };

  useEffect(() => {
    // Load current user and recent users on component mount
    const initializeData = async () => {
      await loadCurrentUser();
      await loadRecentUsers();
    };
    initializeData();
  }, []);

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

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
      setError(null);
    }
  }, [searchQuery]);

  const loadRecentUsers = async () => {
    try {
      setError(null);
      // Get a small paginated list of users as "recent"
      const response = await UserDetailService.getUserDetailsPaginated(
        0,
        5,
        "displayName",
        "asc"
      );
      if (response.result && response.result.content) {
        const mappedUsers = response.result.content
          .map(mapUserDetailToSearchResult)
          .filter(
            (user: UserSearchResult) =>
              currentUserDetail && user.id !== currentUserDetail.id
          ); // Filter out current user
        setRecentUsers(mappedUsers.slice(0, 3)); // Show only first 3 as recent
      }
    } catch (err) {
      console.error("Error loading recent users:", err);
      setError("Failed to load recent users");
    }
  };

  const searchUsers = async (query: string) => {
    setIsLoading(true);
    setError(null);

    try {
      // Search only by display name
      const displayNameResults =
        await UserDetailService.searchByDisplayName(query);

      const mappedResults = (displayNameResults.result || [])
        .map(mapUserDetailToSearchResult)
        .filter(
          (user) => currentUserDetail && user.id !== currentUserDetail.id
        ); // Filter out current user
      setSearchResults(mappedResults);
    } catch (err) {
      console.error("Error searching users:", err);
      setError("Failed to search users. Please try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewProfile = (user: UserSearchResult) => {
    // Navigate to user profile using parent navigator
    const parentNavigation =
      navigation.getParent<StackNavigationProp<AuthedStackParamList>>();
    if (parentNavigation) {
      parentNavigation.navigate("UserProfile", {
        userDetailId: user.id,
        userDisplayName: user.displayName,
      });
    }
  };

  const handleUserSelect = async (user: UserSearchResult) => {
    if (!currentUserDetail) {
      setError("Unable to get current user information. Please try again.");
      return;
    }

    if (isCreatingConversation || isAddingMember) return; // Prevent multiple calls

    if (isAddMemberMode && conversationId) {
      // Add member to existing conversation
      setIsAddingMember(true);
      try {
        await ConversationService.addMemberToConversation(
          conversationId,
          user.id
        );
        await refreshConversations();
        Alert.alert(
          "Success",
          `${user.displayName} has been added to the group`
        );
        navigation.goBack();
      } catch (error) {
        console.error("Error adding member:", error);
        setError("Failed to add member. Please try again.");
      } finally {
        setIsAddingMember(false);
      }
    } else {
      // Create a direct conversation with the selected user
      setIsCreatingConversation(true);
      try {
        const conversationRequest: ConversationRequest = {
          participantIds: [currentUserDetail.id, user.id],
          conversationType: "DIRECT",
        };

        const response =
          await ConversationService.createConversation(conversationRequest);

        if (response.result) {
          // Add the new conversation to the context
          addConversation(response.result);

          // Navigate to the newly created conversation using parent navigator
          const parentNavigation = navigation.getParent();
          if (parentNavigation) {
            // Construct avatar URL properly
            // user.avatar can be either { url: string } or FileResponse with fileName
            const avatarUrl = user.avatar?.url || null;

            parentNavigation.navigate("Conversation", {
              conversationId: response.result.conversationId,
              conversationName:
                response.result.conversationName || user.displayName,
              avatar: avatarUrl ? { uri: avatarUrl } : undefined,
            });
          }
        } else {
          setError("Failed to create conversation. Please try again.");
        }
      } catch (error) {
        console.error("Error creating conversation:", error);
        setError(
          "Failed to create conversation. Please check your connection and try again."
        );
      } finally {
        setIsCreatingConversation(false);
      }
    }
  };

  const renderUserItem = ({ item }: { item: UserSearchResult }) => (
    <UserItem
      user={item}
      onPress={handleUserSelect}
      onViewProfile={handleViewProfile}
      showProfileButton={true}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="search-outline" size={64} color="#9CA3AF" />
      <Text className="text-gray-500 text-lg mt-4">
        {searchQuery
          ? "No users found"
          : isAddMemberMode
            ? "Search for users to add to the group"
            : "Search for users to chat with"}
      </Text>
      <Text className="text-gray-400 text-sm mt-2">
        {searchQuery
          ? "Try searching with a different name"
          : isAddMemberMode
            ? "Enter a display name or username to find members"
            : "Enter a display name or username to get started"}
      </Text>
    </View>
  );

  const renderErrorState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
      <Text className="text-red-500 text-lg mt-4">Error</Text>
      <Text className="text-gray-400 text-sm mt-2 text-center px-8">
        {error}
      </Text>
      <TouchableOpacity
        className="mt-4 bg-pink-500 px-6 py-2 rounded-full"
        onPress={() =>
          searchQuery ? searchUsers(searchQuery) : loadRecentUsers()
        }
      >
        <Text className="text-white font-semibold">Try Again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderSectionHeader = (title: string) => (
    <View className="px-4 py-2 bg-gray-50">
      <Text className="text-sm font-semibold text-gray-600 uppercase">
        {title}
      </Text>
    </View>
  );

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <SafeAreaView edges={["top", "right", "left"]}>
        <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
          <TouchableOpacity
            className="pr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text className="flex-1 font-bold text-lg">
            {isAddMemberMode ? "Add Member" : "Search Users"}
          </Text>
        </View>

        {/* Search Input */}
        <View className="px-4 py-3 border-b border-gray-200">
          <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
            <Ionicons name="search" size={20} color="#666" />
            <TextInput
              className="flex-1 ml-2 text-base"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </SafeAreaView>

      {/* Loading Overlay */}
      {(isCreatingConversation || isAddingMember) && (
        <View className="absolute inset-0 bg-black bg-opacity-50 flex-1 justify-center items-center z-50">
          <View className="bg-white p-6 rounded-lg items-center">
            <ActivityIndicator size="large" color="#EC4899" />
            <Text className="text-gray-600 mt-3">
              {isAddingMember ? "Adding member..." : "Creating conversation..."}
            </Text>
          </View>
        </View>
      )}

      {/* Content */}
      {error ? (
        renderErrorState()
      ) : isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EC4899" />
          <Text className="text-gray-500 mt-2">Searching users...</Text>
        </View>
      ) : (
        <FlatList
          data={searchQuery ? searchResults : recentUsers}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          ListHeaderComponent={
            !searchQuery && recentUsers.length > 0
              ? () => renderSectionHeader("Recent")
              : searchQuery && searchResults.length > 0
                ? () => renderSectionHeader("Results")
                : null
          }
          contentContainerStyle={{ flexGrow: 1 }}
        />
      )}
    </View>
  );
};

export default UserSearchScreen;
