import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { InboxStackParamList } from "../../Types/response/navigation.types";
import UserDetailService from "../../Services/UserDetailService";
import ConversationService from "../../Services/ConversationService";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { ConversationRequest } from "../../Types/request/ConversationRequest";
import { useConversations } from "../../Context/ConversationProvider";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

type CreateGroupNavigationProp = StackNavigationProp<
  InboxStackParamList,
  "CreateGroup"
>;

interface SelectableUser extends UserDetailResponse {
  isSelected: boolean;
}

export default function CreateGroup() {
  const navigation = useNavigation<CreateGroupNavigationProp>();
  const { getMyConversations, addConversation } = useConversations();
  const [groupName, setGroupName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<SelectableUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<SelectableUser[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<SelectableUser[]>([]);
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Load current user first, then load all users
  useEffect(() => {
    loadCurrentUser();
  }, []);

  // Load all users after current user is loaded
  useEffect(() => {
    if (currentUserDetail) {
      loadUsers();
    }
  }, [currentUserDetail]);

  const loadCurrentUser = async () => {
    try {
      const response = await UserDetailService.getMyDetails();
      console.log("Current user response:", response);
      if (response.result) {
        console.log("Current user detail:", response.result);
        setCurrentUserDetail(response.result);
      }
    } catch (error) {
      console.error("Error loading current user:", error);
    }
  };

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const filtered = users.filter(
        (user) =>
          user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          user.user?.username?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const response = await UserDetailService.getAllUserDetails();
      if (response.result && Array.isArray(response.result)) {
        console.log("Raw user data from API:", response.result);

        // Filter out the current user from the list
        const filteredUsers = response.result.filter(
          (user: UserDetailResponse) =>
            currentUserDetail ? user.id !== currentUserDetail.id : true
        );

        const selectableUsers = filteredUsers.map(
          (user: UserDetailResponse) => {
            console.log("Processing user:", user);
            return {
              ...user,
              isSelected: false,
            };
          }
        );
        console.log("Selectable users:", selectableUsers);
        setUsers(selectableUsers);
        setFilteredUsers(selectableUsers);
      } else {
        console.warn("No users returned or invalid response format");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load users. Please try again.");
      console.error("Error loading users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const searchUsers = async (query: string) => {
    if (query.trim() === "") {
      setFilteredUsers(users);
      return;
    }

    setIsSearching(true);
    try {
      const [displayNameResponse, usernameResponse] = await Promise.all([
        UserDetailService.searchByDisplayName(query),
        UserDetailService.searchByUsername(query),
      ]);

      const displayNameUsers = displayNameResponse.result || [];
      const usernameUsers = usernameResponse.result || [];

      // Combine and deduplicate results
      const combinedUsers = [...displayNameUsers, ...usernameUsers];
      const uniqueUsers = combinedUsers.filter(
        (user, index, self) => index === self.findIndex((u) => u.id === user.id)
      );

      const selectableUsers = uniqueUsers.map((user) => ({
        ...user,
        isSelected: selectedUsers.some((selected) => selected.id === user.id),
      }));

      setFilteredUsers(selectableUsers);
    } catch (error) {
      console.error("Error searching users:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleUserSelect = (user: SelectableUser) => {
    const updatedUsers = filteredUsers.map((u) =>
      u.id === user.id ? { ...u, isSelected: !u.isSelected } : u
    );
    setFilteredUsers(updatedUsers);

    if (user.isSelected) {
      // Remove from selected users
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      // Add to selected users
      setSelectedUsers([...selectedUsers, { ...user, isSelected: true }]);
    }

    // Update the main users array as well
    setUsers(
      users.map((u) =>
        u.id === user.id ? { ...u, isSelected: !u.isSelected } : u
      )
    );
  };

  const handleCreateGroup = async () => {
    if (selectedUsers.length < 1) {
      Alert.alert(
        "Error",
        "Please select at least 1 other user to create a group"
      );
      return;
    }

    if (groupName.trim() === "") {
      Alert.alert("Error", "Please enter a group name");
      return;
    }

    if (groupName.trim().length < 2) {
      Alert.alert("Error", "Group name must be at least 2 characters long");
      return;
    }

    setIsCreating(true);
    try {
      console.log("selectedUsers:", selectedUsers);
      console.log("currentUserDetail:", currentUserDetail);

      // Use UserDetail IDs (user.id), not User IDs (user.userId)
      const participantIds = selectedUsers.map((user) => {
        console.log("Mapping user:", user, "ID:", user.id);
        return user.id;
      });

      // Add current user to the participant list
      if (currentUserDetail) {
        console.log("r:", currentUserDetail.id);
        participantIds.push(currentUserDetail.id);
      } else {
        console.log("No current user detail found!");
      }

      console.log("Final participantIds:", participantIds);

      const conversationRequest: ConversationRequest = {
        participantIds,
        conversationName: groupName.trim(),
        conversationType: "GROUP",
      };

      const response =
        await ConversationService.createConversation(conversationRequest);

      if (response.result) {
        // Add the new conversation to the context
        addConversation(response.result);

        Alert.alert("Success", "Group created successfully!", [
          {
            text: "OK",
            onPress: () => {
              // Construct avatar URL properly for group
              const avatarUrl =
                response.result.avatar?.fileName &&
                response.result.conversationId
                  ? getAvatarUrl(
                      response.result.conversationId,
                      response.result.avatar.fileName
                    )
                  : null;

              navigation.navigate("Conversation", {
                conversationId: response.result.conversationId,
                conversationName: response.result.conversationName,
                avatar: avatarUrl ? { uri: avatarUrl } : undefined,
              });
            },
          },
        ]);
      } else {
        Alert.alert("Error", "Failed to create group. Please try again.");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to create group. Please check your connection and try again."
      );
      console.error("Error creating group:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const renderUserItem = ({ item }: { item: SelectableUser }) => (
    <TouchableOpacity
      className={`flex-row items-center p-4 border-b border-gray-100 ${
        item.isSelected ? "bg-pink-50" : "bg-white"
      }`}
      onPress={() => handleUserSelect(item)}
    >
      <View className="w-12 h-12 bg-gray-300 rounded-full items-center justify-center mr-3">
        {item.avatar ? (
          <Text className="text-sm font-semibold text-gray-600">
            {item.displayName?.charAt(0).toUpperCase()}
          </Text>
        ) : (
          <Feather name="user" size={20} color="#666" />
        )}
      </View>

      <View className="flex-1">
        <Text className="font-semibold text-gray-800">
          {item.displayName || item.user?.username}
        </Text>
        {item.displayName && (
          <Text className="text-sm text-gray-500">@{item.user?.username}</Text>
        )}
      </View>

      <View
        className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
          item.isSelected ? "bg-pink-600 border-pink-600" : "border-gray-300"
        }`}
      >
        {item.isSelected && (
          <Ionicons name="checkmark" size={16} color="white" />
        )}
      </View>
    </TouchableOpacity>
  );

  const renderSelectedUser = ({ item }: { item: SelectableUser }) => (
    <View className="flex-row items-center bg-pink-100 rounded-full px-3 py-2 mr-2 mb-2">
      <Text className="text-pink-800 text-sm mr-2">
        {item.displayName || item.user?.username}
      </Text>
      <TouchableOpacity onPress={() => handleUserSelect(item)}>
        <Ionicons name="close" size={16} color="#be185d" />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "right", "left"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="px-4 pt-4 pb-3 border-b border-gray-100">
          <View className="flex-row items-center justify-between">
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#333" />
            </TouchableOpacity>
            <Text className="text-xl font-bold">Create Group</Text>
            <TouchableOpacity
              onPress={handleCreateGroup}
              disabled={
                isCreating ||
                selectedUsers.length < 1 ||
                groupName.trim() === "" ||
                groupName.trim().length < 2
              }
              className={`px-4 py-2 rounded-full ${
                isCreating ||
                selectedUsers.length < 1 ||
                groupName.trim() === "" ||
                groupName.trim().length < 2
                  ? "bg-gray-300"
                  : "bg-pink-600"
              }`}
            >
              {isCreating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text
                  className={`font-semibold ${
                    isCreating ||
                    selectedUsers.length < 1 ||
                    groupName.trim() === "" ||
                    groupName.trim().length < 2
                      ? "text-gray-500"
                      : "text-white"
                  }`}
                >
                  Create
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Group Name Input */}
        <View className="p-4 border-b border-gray-100">
          <Text className="text-gray-600 mb-2">Group Name</Text>
          <TextInput
            className="border border-gray-300 rounded-lg px-4 py-3 text-base"
            placeholder="Enter group name..."
            value={groupName}
            onChangeText={setGroupName}
            maxLength={50}
          />
        </View>

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <View className="p-4 border-b border-gray-100">
            <Text className="text-gray-600 mb-3">
              Selected Members ({selectedUsers.length})
            </Text>
            <FlatList
              data={selectedUsers}
              renderItem={renderSelectedUser}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ flexGrow: 1 }}
            />
          </View>
        )}

        {/* Search Input */}
        <View className="p-4 border-b border-gray-100">
          <View className="flex-row items-center bg-gray-100 rounded-lg px-3 py-2">
            <Ionicons name="search" size={20} color="#666" className="mr-2" />
            <TextInput
              className="flex-1 text-base ml-2"
              placeholder="Search users..."
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                searchUsers(text);
              }}
            />
            {isSearching && <ActivityIndicator size="small" color="#666" />}
          </View>
        </View>

        {/* Users List */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#e91e63" />
            <Text className="text-gray-500 mt-2">Loading users...</Text>
          </View>
        ) : (
          <FlatList
            data={filteredUsers}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            className="flex-1"
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-20">
                <Feather name="users" size={60} color="#ccc" />
                <Text className="text-gray-400 mt-4 text-lg">
                  {searchQuery ? "No users found" : "No users available"}
                </Text>
              </View>
            }
          />
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
