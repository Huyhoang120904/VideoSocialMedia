import React, { useEffect, useState, useCallback } from "react";
import { ScrollView, ActivityIndicator, Alert, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useAuth } from "../../Context/AuthProvider";
import UserDetailService from "../../Services/UserDetailService";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { useConversations } from "../../Context/ConversationProvider";
import {
  fetchFeedItemsByUserId,
  fetchLovedFeedItems,
  VideoItem,
} from "../../Services/FeedItemService";
import { ProfileHeader } from "../../Components/Profile/ProfileHeader";
import { ProfileInfo } from "../../Components/Profile/ProfileInfo";
import { ProfileTabs } from "../../Components/Profile/ProfileTabs";
import { ProfileFeedGrid } from "../../Components/Profile/ProfileFeedGrid";
import { AuthedStackParamList } from "../../Types/response/navigation.types";

export default function Profile() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [feedItems, setFeedItems] = useState<VideoItem[]>([]);
  const [feedItemsLoading, setFeedItemsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");
  const [totalFeedItems, setTotalFeedItems] = useState(0);
  const [likedFeedItems, setLikedFeedItems] = useState<VideoItem[]>([]);
  const [likedFeedItemsLoading, setLikedFeedItemsLoading] = useState(false);
  const [likedFeedItemsError, setLikedFeedItemsError] = useState<string | null>(
    null
  );
  const [hasFetchedLikedFeedItems, setHasFetchedLikedFeedItems] =
    useState(false);
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

  const fetchLovedFeedItemsList = async () => {
    if (likedFeedItemsLoading) {
      return;
    }

    try {
      setLikedFeedItemsLoading(true);
      setLikedFeedItemsError(null);
      const response = await fetchLovedFeedItems(0, 50);
      if (response.code === 1000 && response.result) {
        setLikedFeedItems(response.result.videos || []);
      } else {
        setLikedFeedItems([]);
      }
    } catch (error) {
      console.error("Error fetching loved feed items:", error);
      setLikedFeedItemsError(
        "Unable to load liked videos. Pull to refresh or try again later."
      );
    } finally {
      setLikedFeedItemsLoading(false);
      setHasFetchedLikedFeedItems(true);
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

  const handleFeedItemPress = (item: VideoItem) => {
    if (activeTab === "liked") {
      navigation.navigate("LikedFeed", { initialFeedItemId: item.id });
      return;
    }

    if (!userDetails?.id) {
      return;
    }

    const parentNavigation = navigation.getParent() as
      | StackNavigationProp<AuthedStackParamList>
      | undefined;

    const targetUserId = item.uploaderId || userDetails.id;
    const targetDisplayName =
      item.uploaderName ||
      userDetails.displayName ||
      userDetails.shownName ||
      "My Videos";

    parentNavigation?.navigate("UserFeed", {
      userDetailId: targetUserId,
      initialFeedItemId: item.id,
      userDisplayName: targetDisplayName,
    });
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

  const handleTabChange = (tab: "posts" | "liked") => {
    if (tab === "liked" && !hasFetchedLikedFeedItems) {
      fetchLovedFeedItemsList();
    }
    setActiveTab(tab);
  };

  if (!userDetails) {
    return null;
  }

  const headerContent = (
    <>
      <ProfileHeader onLogout={handleLogout} />

      <ProfileInfo
        userDetails={userDetails}
        totalFeedItems={totalFeedItems}
        onEditProfile={handleEditProfile}
        onFollowingPress={handleFollowingPress}
        onFollowersPress={handleFollowersPress}
      />

      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {headerContent}

        {activeTab === "posts" ? (
          <ProfileFeedGrid
            feedItems={feedItems}
            isLoading={feedItemsLoading}
            onFeedItemPress={handleFeedItemPress}
          />
        ) : (
          <ProfileFeedGrid
            feedItems={likedFeedItems}
            isLoading={likedFeedItemsLoading}
            onFeedItemPress={handleFeedItemPress}
            emptyTitle={
              likedFeedItemsError
                ? "Unable to load liked videos"
                : "No liked videos yet"
            }
            emptyDescription={
              likedFeedItemsError ||
              "Videos you like will appear here once you tap the heart icon."
            }
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
