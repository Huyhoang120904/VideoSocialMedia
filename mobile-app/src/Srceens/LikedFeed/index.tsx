import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text, TouchableOpacity } from "react-native";
import { StackNavigationProp } from "@react-navigation/stack";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { FeedItem } from "../../Store/feedSlice";
import { fetchLovedFeedItemsList } from "../../Services/FeedService";
import { ProfileLikedFeedList } from "../../Components/Profile/ProfileLikedFeedList";

const LikedFeedScreen = () => {
  const navigation =
    useNavigation<StackNavigationProp<AuthedStackParamList, "LikedFeed">>();
  const route = useRoute<RouteProp<AuthedStackParamList, "LikedFeed">>();

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initialFeedItemId = route.params?.initialFeedItemId;

  const loadLovedFeed = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetchLovedFeedItemsList({ size: 40 });
      if (response.code === 1000 && response.result) {
        setFeedItems(response.result);
      } else {
        setFeedItems([]);
      }
    } catch (err: any) {
      console.error("Error loading loved feed:", err);
      setError(err?.message || "Failed to load liked videos.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLovedFeed();
  }, [loadLovedFeed]);

  const headerComponent = (
    <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
      <TouchableOpacity onPress={() => navigation.goBack()} className="p-1">
        <Ionicons name="arrow-back" size={22} color="#111827" />
      </TouchableOpacity>
      <Text className="text-gray-900 text-lg font-semibold">Liked videos</Text>
      <View className="w-6" />
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-black" edges={["top", "left", "right"]}>
      <ProfileLikedFeedList
        headerComponent={headerComponent}
        feedItems={feedItems}
        isLoading={isLoading}
        error={error}
        onRetry={loadLovedFeed}
        initialFeedItemId={initialFeedItemId}
      />
    </SafeAreaView>
  );
};

export default LikedFeedScreen;
