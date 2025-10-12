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
import { useAuth } from "../../Context/AuthProvider";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import UserDetailService from "../../Services/UserDetailService";

type UserProfileNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "UserProfile"
>;

interface UserProfileRouteParams {
  userId: string;
  userDisplayName?: string;
}

const UserProfileScreen = () => {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);

  // Get params from navigation
  const params = route.params as UserProfileRouteParams;
  const userId = params.userId;
  const userDisplayName = params.userDisplayName || "User";

  useEffect(() => {
    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Load the target user's details
        const userResponse =
          await UserDetailService.getUserDetailByUserId(userId);
        if (userResponse.result) {
          setUserDetail(userResponse.result);
        }

        // Load current user's details
        const currentUserResponse = await UserDetailService.getMyDetails();
        if (currentUserResponse.result) {
          setCurrentUserDetail(currentUserResponse.result);
          setIsCurrentUser(currentUserResponse.result.id === userId);
        }

        // Check if current user is following this user
        if (!isCurrentUser && currentUserResponse.result) {
          const followStatusResponse = await UserDetailService.isFollowing(
            currentUserResponse.result.id,
            userId
          );
          if (followStatusResponse.result !== undefined) {
            setIsFollowing(followStatusResponse.result);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Failed to load user profile. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && userId) {
      loadUserData();
    }
  }, [isAuthenticated, userId]);

  const handleBackPress = () => {
    navigation.goBack();
  };

  const handleFollowToggle = async () => {
    if (!userDetail || !currentUserDetail) return;

    try {
      if (isFollowing) {
        await UserDetailService.unfollowUser(userDetail.id);
        setIsFollowing(false);
        Alert.alert("Success", `You unfollowed ${userDetail.displayName}`);
      } else {
        await UserDetailService.followUser(userDetail.id);
        setIsFollowing(true);
        Alert.alert(
          "Success",
          `You are now following ${userDetail.displayName}`
        );
      }
    } catch (error) {
      console.error("Error toggling follow status:", error);
      Alert.alert("Error", "Failed to update follow status. Please try again.");
    }
  };

  const handleMessage = () => {
    if (userDetail) {
      // Navigate to conversation with this user
      navigation.navigate("Conversation", {
        conversationId: `direct_${currentUserDetail?.id}_${userDetail.id}`,
        conversationName: userDetail.displayName,
        avatar: userDetail.avatar
          ? { uri: userDetail.avatar.url }
          : require("../../../assets/avatar.png"),
        receiverId: userDetail.id,
      });
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#EC4899" />
        <Text className="text-gray-700 font-medium mt-3">
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!userDetail) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <Ionicons name="person-outline" size={64} color="#D1D5DB" />
        <Text className="text-gray-500 text-lg font-medium mt-4">
          User not found
        </Text>
        <TouchableOpacity
          onPress={handleBackPress}
          className="mt-6 px-6 py-3 bg-pink-600 rounded-xl"
        >
          <Text className="text-white font-semibold">Go Back</Text>
        </TouchableOpacity>
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
          <Text className="text-lg font-semibold text-gray-900">Profile</Text>
          <View className="w-6" />
        </View>

        <ScrollView className="flex-1">
          {/* Profile Header */}
          <View className="px-6 py-8 items-center">
            <Image
              source={
                userDetail.avatar
                  ? { uri: userDetail.avatar.url }
                  : require("../../../assets/avatar.png")
              }
              className="w-24 h-24 rounded-full mb-4"
              resizeMode="cover"
            />

            <Text className="text-2xl font-bold text-gray-900 mb-2">
              {userDetail.displayName}
            </Text>

            <Text className="text-gray-500 mb-4">@{userDetail.shownName}</Text>

            {userDetail.bio && (
              <Text className="text-gray-700 text-center mb-6 px-4">
                {userDetail.bio}
              </Text>
            )}

            {/* Stats */}
            <View className="flex-row space-x-8 mb-6">
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-900">
                  {userDetail.followerCount || 0}
                </Text>
                <Text className="text-sm text-gray-500">Followers</Text>
              </View>
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-900">
                  {userDetail.followingCount || 0}
                </Text>
                <Text className="text-sm text-gray-500">Following</Text>
              </View>
            </View>

            {/* Action Buttons */}
            {!isCurrentUser && (
              <View className="flex-row space-x-3 w-full">
                <TouchableOpacity
                  onPress={handleFollowToggle}
                  className={`flex-1 py-3 px-6 rounded-xl ${
                    isFollowing
                      ? "bg-gray-200 border border-gray-300"
                      : "bg-pink-600"
                  }`}
                  activeOpacity={0.8}
                >
                  <Text
                    className={`text-center font-semibold ${
                      isFollowing ? "text-gray-700" : "text-white"
                    }`}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleMessage}
                  className="flex-1 py-3 px-6 bg-gray-100 rounded-xl border border-gray-200"
                  activeOpacity={0.8}
                >
                  <Text className="text-center font-semibold text-gray-700">
                    Message
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {isCurrentUser && (
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to edit profile
                  Alert.alert(
                    "Edit Profile",
                    "Edit profile feature coming soon!"
                  );
                }}
                className="w-full py-3 px-6 bg-pink-600 rounded-xl"
                activeOpacity={0.8}
              >
                <Text className="text-center font-semibold text-white">
                  Edit Profile
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Additional Info */}
          <View className="px-6 pb-8">
            <View className="bg-gray-50 rounded-2xl p-4">
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Account Information
              </Text>
              <View className="space-y-2">
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Username</Text>
                  <Text className="text-gray-900 font-medium">
                    @{userDetail.shownName}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-gray-600">Member since</Text>
                  <Text className="text-gray-900 font-medium">Unknown</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default UserProfileScreen;
