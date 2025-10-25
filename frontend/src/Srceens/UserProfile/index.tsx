import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
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
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";
import { fetchVideosByUserId } from "../../Services/VideoService";
import { Video } from "expo-av";

const { width } = Dimensions.get("window");

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
  const [videos, setVideos] = useState<any[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [totalVideos, setTotalVideos] = useState(0);

  // Get params from navigation
  const params = route.params as UserProfileRouteParams;
  const userDetailId = params.userDetailId;
  const userDisplayName = params.userDisplayName || "User";

  const fetchUserVideos = async (userId: string) => {
    try {
      setVideosLoading(true);
      const response = await fetchVideosByUserId(userId, 0, 50);
      if (response.code === 1000 && response.result) {
        setVideos(response.result.videos);
        setTotalVideos(response.result.totalElements);
      }
    } catch (error) {
      console.error("Error fetching user videos:", error);
    } finally {
      setVideosLoading(false);
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
          avatar: avatarUrl
            ? { uri: avatarUrl }
            : require("../../../assets/avatar.png"),
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
            {(() => {
              const avatarUrl =
                userDetail.avatar?.fileName && userDetail.id
                  ? getAvatarUrl(userDetail.id, userDetail.avatar.fileName)
                  : null;
              return (
                <Image
                  source={
                    avatarUrl
                      ? { uri: avatarUrl }
                      : require("../../../assets/avatar.png")
                  }
                  className="w-24 h-24 rounded-full mb-4"
                  resizeMode="cover"
                />
              );
            })()}

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
              <TouchableOpacity
                className="items-center"
                onPress={() => {
                  navigation.navigate("FollowersList", {
                    userDetailId: userDetail.id,
                    initialTab: "followers",
                    userName: userDetail.displayName || userDetail.shownName,
                  });
                }}
                activeOpacity={0.7}
              >
                <Text className="text-xl font-bold text-gray-900">
                  {formatNumber(userDetail.followerCount || 0)}
                </Text>
                <Text className="text-sm text-gray-500">Followers</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="items-center"
                onPress={() => {
                  navigation.navigate("FollowersList", {
                    userDetailId: userDetail.id,
                    initialTab: "following",
                    userName: userDetail.displayName || userDetail.shownName,
                  });
                }}
                activeOpacity={0.7}
              >
                <Text className="text-xl font-bold text-gray-900">
                  {formatNumber(userDetail.followingCount || 0)}
                </Text>
                <Text className="text-sm text-gray-500">Following</Text>
              </TouchableOpacity>
              <View className="items-center">
                <Text className="text-xl font-bold text-gray-900">
                  {formatNumber(totalVideos)}
                </Text>
                <Text className="text-sm text-gray-500">Videos</Text>
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
                  disabled={isCreatingConversation}
                >
                  {isCreatingConversation ? (
                    <ActivityIndicator size="small" color="#6B7280" />
                  ) : (
                    <Text className="text-center font-semibold text-gray-700">
                      Message
                    </Text>
                  )}
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

          {/* Tabs Section */}
          <View className="border-t border-gray-200 mt-4">
            <View className="flex-row">
              <TouchableOpacity 
                className={`flex-1 py-4 border-b-2 ${activeTab === 'posts' ? 'border-pink-600' : 'border-transparent'}`}
                onPress={() => setActiveTab('posts')}
              >
                <Text className={`text-center font-semibold ${activeTab === 'posts' ? 'text-gray-900' : 'text-gray-600'}`}>
                  Posts
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className={`flex-1 py-4 border-b-2 ${activeTab === 'liked' ? 'border-pink-600' : 'border-transparent'}`}
                onPress={() => setActiveTab('liked')}
              >
                <Text className={`text-center font-semibold ${activeTab === 'liked' ? 'text-gray-900' : 'text-gray-600'}`}>
                  Liked
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Videos Grid */}
          {activeTab === 'posts' && (
            <View className="flex-1 px-2 py-2">
              {videosLoading ? (
                <View className="items-center justify-center py-20">
                  <ActivityIndicator size="large" color="#EC4899" />
                  <Text className="text-gray-700 mt-4">Loading videos...</Text>
                </View>
              ) : videos.length === 0 ? (
                <View className="items-center justify-center py-20">
                  <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mb-4">
                    <Text className="text-gray-600 text-2xl">📹</Text>
                  </View>
                  <Text className="text-gray-600 text-lg mb-2">No posts yet</Text>
                  <Text className="text-gray-500 text-sm text-center">
                    {isCurrentUser ? "You haven't posted any videos yet" : "This user hasn't posted any videos yet"}
                  </Text>
                </View>
              ) : (
                <FlatList
                  data={videos}
                  numColumns={3}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      className="m-1 bg-gray-900 rounded-lg overflow-hidden"
                      style={{ 
                        width: (width - 24) / 3, 
                        height: ((width - 24) / 3) * 16 / 9
                      }}
                      activeOpacity={0.8}
                      onPress={() => {
                        // Navigate to Home tab with videoId
                        navigation.navigate('MainTabs', { 
                          screen: 'Home', 
                          params: { videoId: item.id } 
                        });
                      }}
                    >
                      <Video
                        source={{ uri: item.uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                        shouldPlay={false}
                        isLooping={false}
                        isMuted
                        useNativeControls={false}
                      />
                      
                      {/* Play Icon Overlay */}
                      <View className="absolute inset-0 justify-center items-center">
                        <View className="bg-black/30 rounded-full p-2">
                          <Ionicons name="play" size={20} color="white" />
                        </View>
                      </View>

                      {/* Bottom Info */}
                      <View className="absolute bottom-0 left-0 right-0 p-1.5" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                        <View className="flex-row items-center">
                          <Ionicons name="heart" size={10} color="white" />
                          <Text className="text-white text-xs ml-1 font-semibold">
                            {formatNumber(item.likes || 0)}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          )}

          {activeTab === 'liked' && (
            <View className="flex-1 px-4 py-6">
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mb-4">
                  <Text className="text-gray-600 text-2xl">❤️</Text>
                </View>
                <Text className="text-gray-600 text-lg mb-2">No liked videos</Text>
                <Text className="text-gray-500 text-sm text-center">
                  Liked videos will appear here
                </Text>
              </View>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

export default UserProfileScreen;
