import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../Context/AuthProvider";
import { useConversations } from "../../Context/ConversationProvider";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { ConversationRequest } from "../../Types/request/ConversationRequest";
import UserDetailService from "../../Services/UserDetailService";
import ConversationService from "../../Services/ConversationService";
import { getAvatarUrl, UNKNOWN_AVATAR } from "../../Utils/ImageUrlHelper";
import {
  fetchFeedItemsByUserId,
  fetchLovedFeedItems,
  VideoItem,
} from "../../Services/FeedItemService";
import ReportTicketService from "../../Services/ReportTicketService";
import {
  FeedItemType as ReportFeedItemType,
  ReportCategory,
  REPORT_CATEGORY_LABELS,
} from "../../Types/request/ReportTicketRequest";
import { ProfileStats } from "../../Components/Profile/ProfileStats";
import { ProfileTabs } from "../../Components/Profile/ProfileTabs";
import { ProfileFeedGrid } from "../../Components/Profile/ProfileFeedGrid";
import { ProfileLikedEmptyState } from "../../Components/Profile/ProfileLikedEmptyState";

type UserProfileNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "UserProfile"
>;

interface UserProfileRouteParams {
  userDetailId: string;
  userDisplayName?: string;
}

const UserProfileScreen = () => {
  const navigation = useNavigation<UserProfileNavigationProp>();
  const route = useRoute();
  const { isAuthenticated } = useAuth();
  const { addConversation } = useConversations();

  const [isLoading, setIsLoading] = useState(true);
  const [userDetail, setUserDetail] = useState<UserDetailResponse | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isCreatingConversation, setIsCreatingConversation] = useState(false);
  const [currentUserDetail, setCurrentUserDetail] =
    useState<UserDetailResponse | null>(null);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "liked">("posts");
  const [totalVideos, setTotalVideos] = useState(0);
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedCategory, setSelectedCategory] =
    useState<ReportCategory | null>(null);
  const [reportDetails, setReportDetails] = useState("");
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [likedVideos, setLikedVideos] = useState<VideoItem[]>([]);
  const [likedVideosLoading, setLikedVideosLoading] = useState(false);
  const [likedVideosError, setLikedVideosError] = useState<string | null>(null);
  const [hasFetchedLikedVideos, setHasFetchedLikedVideos] = useState(false);

  // Get params from navigation
  const params = route.params as UserProfileRouteParams;
  const userDetailId = params.userDetailId;
  const fallbackDisplayName = params.userDisplayName || "User";

  const fetchUserVideos = async (userId: string) => {
    try {
      setVideosLoading(true);
      const response = await fetchFeedItemsByUserId(userId, 0, 50);
      if (response.code === 1000 && response.result) {
        setVideos(response.result.videos || []);
        setTotalVideos(response.result.totalElements);
      }
    } catch (error) {
      console.error("Error fetching user feed items:", error);
    } finally {
      setVideosLoading(false);
    }
  };

  useEffect(() => {
    const loadUserData = async () => {
      console.log("Loading user profile for userDetailId:", userDetailId);
      setIsLoading(true);
      try {
        // Load the target user's details
        console.log("Fetching user details by userDetailId:", userDetailId);
        const userResponse =
          await UserDetailService.getUserDetailById(userDetailId);
        console.log("User response:", userResponse);

        if (userResponse.result) {
          setUserDetail(userResponse.result);
          // Fetch videos for this user
          fetchUserVideos(userDetailId);
        } else {
          console.error("No user result found");
          Alert.alert("Error", "User not found.");
          setIsLoading(false);
          navigation.goBack();
          return;
        }

        // Load current user's details
        const currentUserResponse = await UserDetailService.getMyDetails();
        if (currentUserResponse.result) {
          setCurrentUserDetail(currentUserResponse.result);
          setIsCurrentUser(currentUserResponse.result.id === userDetailId);
        }

        // Check if current user is following this user
        if (currentUserResponse.result?.id !== userDetailId) {
          const followStatusResponse = await UserDetailService.isFollowing(
            currentUserResponse.result.id,
            userDetailId
          );
          if (followStatusResponse.result !== undefined) {
            setIsFollowing(followStatusResponse.result);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        Alert.alert("Error", "Failed to load user profile. Please try again.");
        setIsLoading(false);
        navigation.goBack();
        return;
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated && userDetailId) {
      loadUserData();
    } else {
      console.log(
        "Not loading: isAuthenticated=",
        isAuthenticated,
        "userDetailId=",
        userDetailId
      );
      if (!userDetailId) {
        Alert.alert("Error", "Invalid user detail ID");
        navigation.goBack();
      }
    }
  }, [isAuthenticated, userDetailId]);

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

  const handleMessage = async () => {
    if (!userDetail || !currentUserDetail || isCreatingConversation) return;

    setIsCreatingConversation(true);
    try {
      const conversationRequest: ConversationRequest = {
        participantIds: [currentUserDetail.id, userDetail.id],
        conversationType: "DIRECT",
      };

      const response =
        await ConversationService.createConversation(conversationRequest);

      if (response.result) {
        // Add the new conversation to the context
        addConversation(response.result);

        // Navigate to the conversation
        const avatarUrl =
          userDetail.avatar?.fileName && userDetail.id
            ? getAvatarUrl(userDetail.id, userDetail.avatar.fileName)
            : null;

        navigation.navigate("Conversation", {
          conversationId: response.result.conversationId,
          conversationName:
            response.result.conversationName || userDetail.displayName,
          avatar: avatarUrl ? { uri: avatarUrl } : UNKNOWN_AVATAR,
          receiverId: userDetail.id,
        });
      } else {
        Alert.alert(
          "Error",
          "Failed to create conversation. Please try again."
        );
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      Alert.alert(
        "Error",
        "Failed to create conversation. Please check your connection and try again."
      );
    } finally {
      setIsCreatingConversation(false);
    }
  };

  const handleReport = () => {
    setShowReportModal(true);
  };

  const handleFeedItemPress = (item: VideoItem) => {
    if (activeTab === "liked" && isCurrentUser) {
      navigation.navigate("LikedFeed", { initialFeedItemId: item.id });
      return;
    }

    if (!userDetail) {
      return;
    }

    navigation.navigate("UserFeed", {
      userDetailId: item.uploaderId || userDetail.id,
      initialFeedItemId: item.id,
      userDisplayName:
        item.uploaderName ||
        userDetail.displayName ||
        userDetail.shownName ||
        fallbackDisplayName,
    });
  };

  const handleFollowingPress = () => {
    if (!userDetail) return;

    navigation.navigate("FollowersList", {
      userDetailId: userDetail.id,
      initialTab: "following",
      userName:
        userDetail.displayName || userDetail.shownName || fallbackDisplayName,
    });
  };

  const handleFollowersPress = () => {
    if (!userDetail) return;

    navigation.navigate("FollowersList", {
      userDetailId: userDetail.id,
      initialTab: "followers",
      userName:
        userDetail.displayName || userDetail.shownName || fallbackDisplayName,
    });
  };

  const fetchLovedVideos = async () => {
    if (likedVideosLoading) {
      return;
    }

    try {
      setLikedVideosLoading(true);
      setLikedVideosError(null);
      const response = await fetchLovedFeedItems(0, 50);
      if (response.code === 1000 && response.result) {
        setLikedVideos(response.result.videos || []);
      } else {
        setLikedVideos([]);
      }
    } catch (error) {
      console.error("Error fetching loved feed items:", error);
      setLikedVideosError(
        "Unable to load liked videos. Pull to refresh and try again."
      );
    } finally {
      setLikedVideosLoading(false);
      setHasFetchedLikedVideos(true);
    }
  };

  const handleTabChange = (tab: "posts" | "liked") => {
    if (tab === "liked" && isCurrentUser && !hasFetchedLikedVideos) {
      fetchLovedVideos();
    }
    setActiveTab(tab);
  };

  const handleSubmitReport = async () => {
    if (!selectedCategory) {
      Alert.alert("Error", "Please select a report category");
      return;
    }

    if (!userDetail) return;

    setIsSubmittingReport(true);
    try {
      const response = await ReportTicketService.createReportTicket({
        feedItemType: ReportFeedItemType.USER_DETAIL,
        targetId: userDetail.id,
        reportCategory: selectedCategory,
        violationContent: reportDetails || undefined,
      });

      if (response.code === 1000) {
        Alert.alert(
          "Report Submitted",
          "Thank you for your report. We'll review it and take appropriate action.",
          [
            {
              text: "OK",
              onPress: () => {
                setShowReportModal(false);
                setSelectedCategory(null);
                setReportDetails("");
              },
            },
          ]
        );
      } else {
        Alert.alert("Error", response.message || "Failed to submit report");
      }
    } catch (error) {
      console.error("Error submitting report:", error);
      Alert.alert("Error", "Failed to submit report. Please try again.");
    } finally {
      setIsSubmittingReport(false);
    }
  };

  if (isLoading) {
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

  if (!userDetail) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        edges={["top", "left", "right"]}
      >
        <View className="flex-1 items-center justify-center">
          <Ionicons name="person-outline" size={64} color="#D1D5DB" />
          <Text className="text-gray-500 text-lg font-medium mt-4">
            User not found
          </Text>
          <TouchableOpacity
            onPress={handleBackPress}
            className="mt-6 px-6 py-3 bg-gray-900 rounded-lg"
          >
            <Text className="text-white font-semibold">Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const headerTitle =
    userDetail.displayName ||
    userDetail.shownName ||
    fallbackDisplayName ||
    "Profile";

  const headerBar = (
    <View className="flex-row items-center justify-between px-4 py-3">
      <TouchableOpacity onPress={handleBackPress}>
        <Ionicons name="arrow-back" size={24} color="#374151" />
      </TouchableOpacity>
      <Text className="text-gray-900 text-lg font-semibold">{headerTitle}</Text>
      {!isCurrentUser ? (
        <TouchableOpacity onPress={handleReport}>
          <Ionicons name="flag-outline" size={24} color="#374151" />
        </TouchableOpacity>
      ) : (
        <View className="w-6" />
      )}
    </View>
  );

  const profileInfoSection = (
    <View className="items-center px-6 py-6">
      <View className="mb-4">
        {(() => {
          const avatarUrl =
            userDetail.avatar?.fileName && userDetail.id
              ? getAvatarUrl(userDetail.id, userDetail.avatar.fileName)
              : null;
          const avatarSource = avatarUrl ? { uri: avatarUrl } : UNKNOWN_AVATAR;
          return (
            <Image
              source={avatarSource}
              className="w-24 h-24 rounded-full"
              style={{ resizeMode: "cover" }}
            />
          );
        })()}
      </View>

      <Text className="text-gray-900 text-xl font-bold mb-1">
        {userDetail.displayName || "Unknown User"}
      </Text>

      {userDetail.shownName && (
        <Text className="text-gray-600 text-base mb-4">
          @{userDetail.shownName}
        </Text>
      )}

      <ProfileStats
        followingCount={userDetail.followingCount || 0}
        followerCount={userDetail.followerCount || 0}
        feedItemCount={totalVideos}
        onFollowingPress={handleFollowingPress}
        onFollowersPress={handleFollowersPress}
      />

      {userDetail.bio && (
        <View className="w-full mb-6">
          <Text className="text-gray-700 text-center text-sm leading-5">
            {userDetail.bio}
          </Text>
        </View>
      )}

      {!isCurrentUser && (
        <View className="flex-row w-full gap-3 mb-6">
          <TouchableOpacity
            onPress={handleFollowToggle}
            className={`flex-1 rounded-lg py-3 ${
              isFollowing ? "bg-gray-200" : "bg-gray-900"
            }`}
            activeOpacity={0.7}
          >
            <Text
              className={`text-center font-semibold ${
                isFollowing ? "text-gray-800" : "text-white"
              }`}
            >
              {isFollowing ? "Following" : "Follow"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleMessage}
            className="flex-1 bg-gray-200 rounded-lg py-3"
            activeOpacity={0.7}
            disabled={isCreatingConversation}
          >
            {isCreatingConversation ? (
              <ActivityIndicator size="small" color="#6B7280" />
            ) : (
              <Text className="text-gray-800 text-center font-semibold">
                Message
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {isCurrentUser && (
        <View className="flex-row w-full gap-3 mb-6">
          <TouchableOpacity
            onPress={() => {
              navigation.navigate("EditProfile");
            }}
            className="flex-1 bg-gray-900 rounded-lg py-3"
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
      )}
    </View>
  );

  const headerContent = (
    <>
      {headerBar}
      {profileInfoSection}
      <ProfileTabs activeTab={activeTab} onTabChange={handleTabChange} />
    </>
  );

  const reportModal = (
    <Modal
      visible={showReportModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowReportModal(false)}
    >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl max-h-[80%]">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between p-4 border-b border-gray-200">
              <Text className="text-lg font-bold text-gray-900">
                Report User
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setShowReportModal(false);
                  setSelectedCategory(null);
                  setReportDetails("");
                }}
              >
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView className="px-4 py-4">
              {/* Info Text */}
              <Text className="text-gray-600 text-sm mb-4">
                Please select a reason for reporting this user:
              </Text>

              {/* Report Categories */}
              {Object.values(ReportCategory).map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => setSelectedCategory(category)}
                  className={`p-4 mb-2 rounded-lg border ${
                    selectedCategory === category
                      ? "border-gray-900 bg-gray-100"
                      : "border-gray-300 bg-white"
                  }`}
                  activeOpacity={0.7}
                >
                  <View className="flex-row items-center justify-between">
                    <Text
                      className={`text-base ${
                        selectedCategory === category
                          ? "text-gray-900 font-semibold"
                          : "text-gray-700"
                      }`}
                    >
                      {REPORT_CATEGORY_LABELS[category]}
                    </Text>
                    {selectedCategory === category && (
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#111827"
                      />
                    )}
                  </View>
                </TouchableOpacity>
              ))}

              {/* Additional Details */}
              <View className="mt-4 mb-2">
                <Text className="text-gray-700 font-semibold mb-2">
                  Additional Details (Optional)
                </Text>
                <TextInput
                  className="border border-gray-300 rounded-lg p-3 text-gray-900 min-h-[100px]"
                  placeholder="Provide more context about this report..."
                  placeholderTextColor="#9CA3AF"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  value={reportDetails}
                  onChangeText={setReportDetails}
                />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmitReport}
                disabled={!selectedCategory || isSubmittingReport}
                className={`py-4 rounded-lg mt-4 mb-6 ${
                  !selectedCategory || isSubmittingReport
                    ? "bg-gray-300"
                    : "bg-gray-900"
                }`}
                activeOpacity={0.7}
              >
                {isSubmittingReport ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text className="text-white text-center font-semibold text-base">
                    Submit Report
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
    </Modal>
  );

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "left", "right"]}>
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {headerContent}

        {activeTab === "posts" && (
          <ProfileFeedGrid
            feedItems={videos}
            isLoading={videosLoading}
            onFeedItemPress={handleFeedItemPress}
            emptyDescription={
              isCurrentUser
                ? "You haven't posted any videos yet"
                : "This user hasn't posted any videos yet"
            }
          />
        )}

        {activeTab === "liked" &&
          (isCurrentUser ? (
            <ProfileFeedGrid
              feedItems={likedVideos}
              isLoading={likedVideosLoading}
              onFeedItemPress={handleFeedItemPress}
              emptyTitle={
                likedVideosError
                  ? "Unable to load liked videos"
                  : "No liked videos yet"
              }
              emptyDescription={
                likedVideosError ||
                "Videos you like will appear here once you tap the heart icon."
              }
            />
          ) : (
            <ProfileLikedEmptyState description="Liked videos are private and only visible to this user." />
          ))}
      </ScrollView>
      {reportModal}
    </SafeAreaView>
  );
};

export default UserProfileScreen;
