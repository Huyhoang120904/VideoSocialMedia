import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, ActivityIndicator, Alert, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../Context/AuthProvider";
import UserDetailService from "../../Services/UserDetailService";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { useConversations } from "../../Context/ConversationProvider";
import {
  fetchFeedItemsByUserId,
  VideoItem as FeedItem,
} from "../../Services/FeedItemService";
import { ProfileHeader } from "../../Components/Profile/ProfileHeader";
import { ProfileInfo } from "../../Components/Profile/ProfileInfo";
import { ProfileTabs } from "../../Components/Profile/ProfileTabs";
import { ProfileFeedGrid } from "../../Components/Profile/ProfileFeedGrid";
import { ProfileLikedEmptyState } from "../../Components/Profile/ProfileLikedEmptyState";

export default function Profile() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [feedItemsLoading, setFeedItemsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");
  const [totalFeedItems, setTotalFeedItems] = useState(0);
  const { clearConversations } = useConversations();

  useEffect(() => {
    fetchUserDetails();
  }, []);

  // Refresh when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchUserDetails();
    }, [])
  );

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
        // Fetch feed items after getting user details
        if (response.result.id) {
          fetchUserFeedItems(response.result.id);
        }
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

  const fetchUserFeedItems = async (userId: string) => {
    try {
      setFeedItemsLoading(true);
      const response = await fetchFeedItemsByUserId(userId, 0, 50);
      if (response.code === 1000 && response.result) {
        // The response contains both VIDEO and IMAGE_SLIDE feed items
        setFeedItems(response.result.videos);
        setTotalFeedItems(response.result.totalElements);
      }
    } catch (error) {
      console.error("Error fetching user feed items:", error);
    } finally {
      setFeedItemsLoading(false);
    }
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

  const handleFeedItemPress = (feedItemId: string) => {
    navigation.navigate("Home", { videoId: feedItemId });
  };

  const handleFollowingPress = () => {
    if (userDetails?.id) {
      navigation.navigate("FollowersList", {
        userDetailId: userDetails.id,
        initialTab: "following",
        userName: userDetails.displayName || userDetails.shownName,
      });
    }
  };

  const handleFollowersPress = () => {
    if (userDetails?.id) {
      navigation.navigate("FollowersList", {
        userDetailId: userDetails.id,
        initialTab: "followers",
        userName: userDetails.displayName || userDetails.shownName,
      });
    }
  };

  if (!userDetails) {
    return null;
  }

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <ProfileHeader onLogout={handleLogout} />

        <ProfileInfo
          userDetails={userDetails}
          totalFeedItems={totalFeedItems}
          onEditProfile={handleEditProfile}
          onFollowingPress={handleFollowingPress}
          onFollowersPress={handleFollowersPress}
        />

        <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {activeTab === "posts" && (
          <ProfileFeedGrid
            feedItems={feedItems}
            isLoading={feedItemsLoading}
            onFeedItemPress={handleFeedItemPress}
          />
        )}

        {activeTab === "liked" && <ProfileLikedEmptyState />}
      </ScrollView>
    </SafeAreaView>
  );
}
