import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Image,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { UserResponse } from "../../Types/response/UserResponse";
import { InboxStackParamList } from "../../Types/response/navigation.types";

interface UserSearchResult extends UserResponse {
  isOnline?: boolean;
  avatar?: { url: string };
}

type UserSearchNavigationProp = StackNavigationProp<
  InboxStackParamList,
  "UserSearch"
>;

const UserSearchScreen = () => {
  const navigation = useNavigation<UserSearchNavigationProp>();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [recentUsers, setRecentUsers] = useState<UserSearchResult[]>([]);

  // Mock data for demonstration - replace with actual API calls
  const mockUsers: UserSearchResult[] = [
    {
      id: "1",
      username: "john_doe",
      mail: "john@example.com",
      roles: [],
      avatar: { url: "https://picsum.photos/60/60?random=1" },
      isOnline: true,
    },
    {
      id: "2",
      username: "jane_smith",
      mail: "jane@example.com",
      roles: [],
      avatar: { url: "https://picsum.photos/60/60?random=2" },
      isOnline: false,
    },
    {
      id: "3",
      username: "mike_wilson",
      mail: "mike@example.com",
      roles: [],
      avatar: { url: "https://picsum.photos/60/60?random=3" },
      isOnline: true,
    },
    {
      id: "4",
      username: "sarah_johnson",
      mail: "sarah@example.com",
      roles: [],
      avatar: { url: "https://picsum.photos/60/60?random=4" },
      isOnline: false,
    },
  ];

  useEffect(() => {
    // Load recent users on component mount
    setRecentUsers(mockUsers.slice(0, 2));
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      searchUsers(searchQuery);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const searchUsers = async (query: string) => {
    setIsLoading(true);
    // Simulate API call delay
    setTimeout(() => {
      const filtered = mockUsers.filter(
        (user) =>
          user.username.toLowerCase().includes(query.toLowerCase()) ||
          user.mail.toLowerCase().includes(query.toLowerCase())
      );
      setSearchResults(filtered);
      setIsLoading(false);
    }, 500);
  };

  const handleUserSelect = (user: UserSearchResult) => {
    // Navigate to conversation with selected user
    navigation.navigate("Conversation", {
      conversationId: `conv_${user.id}`,
      conversationName: user.username,
      avatar: user.avatar,
    });
  };

  const renderUserItem = ({ item }: { item: UserSearchResult }) => (
    <TouchableOpacity
      className="flex-row items-center px-4 py-3 border-b border-gray-100"
      onPress={() => handleUserSelect(item)}
    >
      <View className="relative">
        <Image
          source={{ uri: item.avatar?.url }}
          className="w-12 h-12 rounded-full"
        />
        {item.isOnline && (
          <View className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
        )}
      </View>

      <View className="flex-1 ml-3">
        <Text className="font-semibold text-base text-gray-800">
          {item.username}
        </Text>
        <Text className="text-sm text-gray-500">{item.mail}</Text>
      </View>

      <View className="flex-row items-center">
        {item.isOnline && (
          <View className="flex-row items-center mr-2">
            <View className="w-2 h-2 bg-green-500 rounded-full mr-1" />
            <Text className="text-xs text-green-500">Online</Text>
          </View>
        )}
        <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
      </View>
    </TouchableOpacity>
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="search-outline" size={64} color="#9CA3AF" />
      <Text className="text-gray-500 text-lg mt-4">
        {searchQuery ? "No users found" : "Search for users to chat with"}
      </Text>
      <Text className="text-gray-400 text-sm mt-2">
        {searchQuery
          ? "Try searching with a different name or email"
          : "Enter a username or email to get started"}
      </Text>
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
      {/* <StatusBar barStyle="dark-content" backgroundColor="#ffffff" /> */}

      {/* Header */}
      <SafeAreaView edges={["top", "right", "left"]}>
        <View className="px-4 py-3 border-b border-gray-200 flex-row items-center">
          <TouchableOpacity
            className="pr-3"
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text className="flex-1 font-bold text-lg">Search Users</Text>
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

      {/* Content */}
      {isLoading ? (
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
