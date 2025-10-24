import React, { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../Context/AuthProvider";
import UserDetailService from "../../Services/UserDetailService";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { useConversations } from "../../Context/ConversationProvider";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";

const { width } = Dimensions.get("window");

type ProfileNavigationProp = StackNavigationProp<AuthedStackParamList>;

export default function Profile() {
  const navigation = useNavigation<ProfileNavigationProp>();
  const { logout } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const { clearConversations } = useConversations();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Refresh when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      fetchUserDetails();
    });
    return unsubscribe;
  }, [navigation]);

  const handleLogout = async () => {
    clearConversations();
    await logout();
  };

  const handleEditProfile = () => {
    navigation.navigate("EditProfile");
  };

  const fetchUserDetails = async () => {
    try {
      setLoading(true);
      const response = await UserDetailService.getMyDetails();
      if (response.code === 1000 && response.result) {
        setUserDetails(response.result);
      } else {
        Alert.alert(
          "Error",
          response.message || "Failed to load profile details"
        );
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
      Alert.alert("Error", "Something went wrong while loading your profile");
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + "M";
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + "K";
    }
    return num.toString();
  };

  if (loading) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["top", "left", "right"]}
      >
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#ff0050" />
          <Text className="text-gray-700 mt-4">Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="flex-row justify-between items-center px-4 py-3">
          <Text className="text-gray-900 text-lg font-semibold">Profile</Text>
          <TouchableOpacity
            className="px-4 py-2 bg-gray-200 rounded-lg"
            onPress={() => handleLogout()}
          >
            <Text className="text-gray-800 text-sm">Log Out</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View className="items-center px-6 py-6">
          {/* Avatar */}
          <View className="mb-4">
            {(() => {
              const avatarUrl =
                userDetails?.avatar?.fileName && userDetails.id
                  ? getAvatarUrl(userDetails.id, userDetails.avatar.fileName)
                  : null;
              return avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-24 h-24 rounded-full"
                  style={{ resizeMode: "cover" }}
                />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gray-300 justify-center items-center">
                  <Text className="text-gray-700 text-2xl font-bold">
                    {userDetails?.displayName?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              );
            })()}
          </View>

          {/* Display Name */}
          <Text className="text-gray-900 text-xl font-bold mb-1">
            {userDetails?.displayName || "Unknown User"}
          </Text>

          {/* Shown Name */}
          {userDetails?.shownName && (
            <Text className="text-gray-600 text-base mb-4">
              @{userDetails.shownName}
            </Text>
          )}

          {/* Stats */}
          <View className="flex-row justify-center items-center mb-6 w-full">
            <TouchableOpacity
              className="items-center flex-1"
              onPress={() => {
                if (userDetails?.id) {
                  navigation.navigate("FollowersList", {
                    userDetailId: userDetails.id,
                    initialTab: "following",
                    userName: userDetails.displayName || userDetails.shownName,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <Text className="text-gray-900 text-lg font-bold">
                {formatNumber(userDetails?.followingCount || 0)}
              </Text>
              <Text className="text-gray-600 text-sm">Following</Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="items-center flex-1"
              onPress={() => {
                if (userDetails?.id) {
                  navigation.navigate("FollowersList", {
                    userDetailId: userDetails.id,
                    initialTab: "followers",
                    userName: userDetails.displayName || userDetails.shownName,
                  });
                }
              }}
              activeOpacity={0.7}
            >
              <Text className="text-gray-900 text-lg font-bold">
                {formatNumber(userDetails?.followerCount || 0)}
              </Text>
              <Text className="text-gray-600 text-sm">Followers</Text>
            </TouchableOpacity>

            <View className="items-center flex-1">
              <Text className="text-gray-900 text-lg font-bold">0</Text>
              <Text className="text-gray-600 text-sm">Likes</Text>
            </View>
          </View>

          {/* Bio */}
          {userDetails?.bio && (
            <View className="w-full mb-6">
              <Text className="text-gray-700 text-center text-sm leading-5">
                {userDetails.bio}
              </Text>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row w-full gap-3 mb-6">
            <TouchableOpacity
              className="flex-1 bg-gray-900 rounded-lg py-3"
              onPress={handleEditProfile}
              activeOpacity={0.7}
            >
              <Text className="text-white text-center font-semibold">
                Edit Profile
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 bg-gray-200 rounded-lg py-3">
              <Text className="text-gray-800 text-center font-semibold">
                Share Profile
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Tabs Section */}
        <View className="border-t border-gray-300">
          <View className="flex-row">
            <TouchableOpacity className="flex-1 py-4 border-b-2 border-gray-900">
              <Text className="text-gray-900 text-center font-semibold">
                Posts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-1 py-4">
              <Text className="text-gray-600 text-center font-semibold">
                Liked
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Posts Grid Placeholder */}
        <View className="flex-1 px-4 py-6">
          <View className="items-center justify-center py-20">
            <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mb-4">
              <Text className="text-gray-600 text-2xl">📹</Text>
            </View>
            <Text className="text-gray-600 text-lg mb-2">No posts yet</Text>
            <Text className="text-gray-500 text-sm text-center">
              When you post videos, they'll appear here
            </Text>
          </View>
        </View>

        {/* Refresh Button */}
        <View className="px-4 pb-6">
          <TouchableOpacity
            className="bg-pink-600 rounded-lg py-3"
            onPress={fetchUserDetails}
          >
            <Text className="text-white text-center font-semibold">
              Refresh Profile
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
