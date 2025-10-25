import React, { useEffect, useState, useCallback } from "react";
import {
  Text,
  TouchableOpacity,
  View,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { useAuth } from "../../Context/AuthProvider";
import UserDetailService from "../../Services/UserDetailService";
import { UserDetailResponse } from "../../Types/response/UserDetailResponse";
import { useConversations } from "../../Context/ConversationProvider";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";
import { fetchVideosByUserId } from "../../Services/VideoService";
import { Video } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

interface VideoItem {
  id: string;
  uri: string;
  title: string;
  likes: number;
  comments: number;
  shares: number;
  outstanding: number;
}

export default function Profile() {
  const navigation = useNavigation<any>();
  const { logout } = useAuth();
  const [userDetails, setUserDetails] = useState<UserDetailResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'liked'>('posts');
  const [totalVideos, setTotalVideos] = useState(0);
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
        // Fetch videos after getting user details
        if (response.result.id) {
          fetchUserVideos(response.result.id);
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
              <Text className="text-gray-900 text-lg font-bold">
                {formatNumber(totalVideos)}
              </Text>
              <Text className="text-gray-600 text-sm">Videos</Text>
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
            <TouchableOpacity 
              className={`flex-1 py-4 border-b-2 ${activeTab === 'posts' ? 'border-gray-900' : 'border-transparent'}`}
              onPress={() => setActiveTab('posts')}
            >
              <Text className={`text-center font-semibold ${activeTab === 'posts' ? 'text-gray-900' : 'text-gray-600'}`}>
                Posts
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className={`flex-1 py-4 border-b-2 ${activeTab === 'liked' ? 'border-gray-900' : 'border-transparent'}`}
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
                <ActivityIndicator size="large" color="#ff0050" />
                <Text className="text-gray-700 mt-4">Loading videos...</Text>
              </View>
            ) : videos.length === 0 ? (
              <View className="items-center justify-center py-20">
                <View className="w-16 h-16 bg-gray-200 rounded-full justify-center items-center mb-4">
                  <Text className="text-gray-600 text-2xl">📹</Text>
                </View>
                <Text className="text-gray-600 text-lg mb-2">No posts yet</Text>
                <Text className="text-gray-500 text-sm text-center">
                  When you post videos, they'll appear here
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
                        navigation.navigate('Home', { videoId: item.id });
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
                Videos you like will appear here
              </Text>
            </View>
          </View>
        )}

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
