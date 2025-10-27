import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import UserDetailService from "../../Services/UserDetailService";
import UserItem, { UserItemData } from "../../Components/UserItem";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

type FollowersListNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "FollowersList"
>;

interface FollowersListRouteParams {
  userDetailId: string;
  initialTab?: "followers" | "following";
  userName?: string;
}

const FollowersListScreen = () => {
  const navigation = useNavigation<FollowersListNavigationProp>();
  const route = useRoute();
  const params = route.params as FollowersListRouteParams;

  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    params.initialTab || "followers"
  );
  const [followers, setFollowers] = useState<UserDetailResponse[]>([]);
  const [following, setFollowing] = useState<UserDetailResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [params.userDetailId]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load both followers and following
      const [followersResponse, followingResponse] = await Promise.all([
        UserDetailService.getFollowers(params.userDetailId),
        UserDetailService.getFollowing(params.userDetailId),
      ]);

      if (followersResponse.result) {
        setFollowers(followersResponse.result);
      }

      if (followingResponse.result) {
        setFollowing(followingResponse.result);
      }
    } catch (error) {
      console.error("Error loading followers/following:", error);
      Alert.alert("Error", "Failed to load data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserPress = (user: UserDetailResponse) => {
    console.log("Navigating to profile for user:", user);
    console.log("User Detail ID:", user.id);

    if (!user.id) {
      Alert.alert("Error", "User Detail ID not available");
      return;
    }

    navigation.navigate("UserProfile", {
      userDetailId: user.id,
      userDisplayName: user.displayName,
    });
  };

  const handleViewProfile = (user: UserDetailResponse) => {
    console.log("Viewing profile for user:", user);
    console.log("User Detail ID:", user.id);

    if (!user.id) {
      Alert.alert("Error", "User Detail ID not available");
      return;
    }

    navigation.navigate("UserProfile", {
      userDetailId: user.id,
      userDisplayName: user.displayName,
    });
  };

  const mapUserToItemData = (user: UserDetailResponse): UserItemData => {
    const avatarUrl =
      user.avatar?.fileName && user.id
        ? getAvatarUrl(user.id, user.avatar.fileName)
        : null;

    return {
      id: user.id,
      displayName: user.displayName || user.shownName || "Unknown User",
      username: user.shownName || user.displayName,
      bio: user.bio,
      avatar: avatarUrl ? { url: avatarUrl } : undefined,
      isOnline: false,
    };
  };

  const renderUserItem = ({ item }: { item: UserDetailResponse }) => (
    <UserItem
      user={mapUserToItemData(item)}
      onPress={() => handleUserPress(item)}
      onViewProfile={() => handleViewProfile(item)}
      showProfileButton={true}
    />
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center py-20">
      <Ionicons name="people-outline" size={64} color="#D1D5DB" />
      <Text className="text-gray-500 text-lg mt-4">
        {activeTab === "followers"
          ? "No followers yet"
          : "Not following anyone"}
      </Text>
      <Text className="text-gray-400 text-sm mt-2 text-center px-8">
        {activeTab === "followers"
          ? "When people follow you, they'll appear here"
          : "Start following people to see them here"}
      </Text>
    </View>
  );

  const currentList = activeTab === "followers" ? followers : following;

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      {/* Header */}
      <View className="px-4 py-3 border-b border-gray-200">
        <View className="flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="p-2 -ml-2"
          >
            <Ionicons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          <View className="flex-1 ml-2">
            <Text className="text-lg font-semibold text-gray-900">
              {params.userName || "User"}
            </Text>
          </View>
        </View>
      </View>

      {/* Tabs */}
      <View className="flex-row border-b border-gray-200">
        <TouchableOpacity
          className={`flex-1 py-4 ${
            activeTab === "followers" ? "border-b-2 border-pink-600" : ""
          }`}
          onPress={() => setActiveTab("followers")}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "followers" ? "text-pink-600" : "text-gray-600"
            }`}
          >
            {followers.length} Followers
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-1 py-4 ${
            activeTab === "following" ? "border-b-2 border-pink-600" : ""
          }`}
          onPress={() => setActiveTab("following")}
        >
          <Text
            className={`text-center font-semibold ${
              activeTab === "following" ? "text-pink-600" : "text-gray-600"
            }`}
          >
            {following.length} Following
          </Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#EC4899" />
          <Text className="text-gray-700 font-medium mt-3">Loading...</Text>
        </View>
      ) : (
        <FlatList
          data={currentList}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={
            currentList.length === 0 ? { flex: 1 } : undefined
          }
        />
      )}
    </SafeAreaView>
  );
};

export default FollowersListScreen;
