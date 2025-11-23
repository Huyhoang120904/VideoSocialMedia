import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  RouteProp,
  useFocusEffect,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { Ionicons } from "@expo/vector-icons";

import FeedPost from "../../Components/Post/FeedPost";
import { FeedItem } from "../../Store/feedSlice";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import {
  fetchUserFeedItems,
  recordFeedItemView,
} from "../../Services/FeedService";

type UserFeedNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "UserFeed"
>;

type UserFeedRouteProp = RouteProp<AuthedStackParamList, "UserFeed">;

const { height } = Dimensions.get("window");

const UserFeedScreen = () => {
  const navigation = useNavigation<UserFeedNavigationProp>();
  const route = useRoute<UserFeedRouteProp>();

  const { userDetailId, initialFeedItemId, userDisplayName } = route.params;

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isScreenActive, setIsScreenActive] = useState(true);

  const flatListRef = useRef<FlatList<FeedItem>>(null);
  const hasScrolledToInitialRef = useRef(false);
  const watchedFeedItemsRef = useRef<Set<string>>(new Set());

  const headerTitle =
    userDisplayName?.trim() && userDisplayName.trim().length > 0
      ? userDisplayName
      : "User Videos";

  const loadUserFeed = useCallback(
    async (showLoader: boolean = true) => {
      if (!userDetailId) {
        setError("Missing user information.");
        setLoading(false);
        return;
      }

      if (showLoader) {
        setLoading(true);
      }

      setError(null);

      try {
        const response = await fetchUserFeedItems(userDetailId, { size: 40 });
        if (response.result) {
          setFeedItems(response.result);
          console.log(`response.result: `, response.result);
          watchedFeedItemsRef.current.clear();
        } else {
          setFeedItems([]);
        }
        hasScrolledToInitialRef.current = false;
      } catch (err: any) {
        console.error("Error loading user feed:", err);
        setError(err?.message || "Failed to load user feed.");
      } finally {
        if (showLoader) {
          setLoading(false);
        }
      }
    },
    [userDetailId]
  );

  useEffect(() => {
    loadUserFeed(true);
  }, [loadUserFeed]);

  useFocusEffect(
    useCallback(() => {
      setIsScreenActive(true);
      return () => setIsScreenActive(false);
    }, [])
  );

  useEffect(() => {
    if (
      !initialFeedItemId ||
      feedItems.length === 0 ||
      hasScrolledToInitialRef.current
    ) {
      return;
    }

    const targetIndex = feedItems.findIndex(
      (item) => item.id === initialFeedItemId
    );

    if (targetIndex !== -1) {
      hasScrolledToInitialRef.current = true;
      setCurrentIndex(targetIndex);
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: targetIndex,
          animated: false,
        });
      }, 100);
    }
  }, [initialFeedItemId, feedItems]);

  useEffect(() => {
    const activeItem = feedItems[currentIndex];
    if (!activeItem) {
      return;
    }

    const feedItemId = activeItem.id;
    if (watchedFeedItemsRef.current.has(feedItemId)) {
      return;
    }

    watchedFeedItemsRef.current.add(feedItemId);
    recordFeedItemView(feedItemId).catch((err) => {
      console.warn("Failed to record feed item view:", err);
      watchedFeedItemsRef.current.delete(feedItemId);
    });
  }, [currentIndex, feedItems]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadUserFeed(false);
    } finally {
      setRefreshing(false);
    }
  }, [loadUserFeed]);

  const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: info.index,
        animated: false,
      });
    }, 300);
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: Array<{ index: number | null }> }) => {
      if (viewableItems.length === 0) {
        return;
      }

      const nextIndex = viewableItems[0].index;
      if (nextIndex !== null && nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 80,
  }).current;

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => (
      <FeedPost
        feedItem={item}
        isActive={index === currentIndex && isScreenActive}
        itemHeight={height}
      />
    ),
    [currentIndex, isScreenActive]
  );

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  const renderLoading = () => (
    <View style={styles.centerContent}>
      <ActivityIndicator size="large" color="#EC4899" />
      <Text style={styles.statusText}>Loading videos...</Text>
    </View>
  );

  const renderError = () => (
    <View style={styles.centerContent}>
      <Ionicons name="alert-circle-outline" size={32} color="#EF4444" />
      <Text style={styles.errorText}>{error}</Text>
      <TouchableOpacity
        style={styles.retryButton}
        onPress={() => loadUserFeed(true)}
      >
        <Text style={styles.retryText}>Try again</Text>
      </TouchableOpacity>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.centerContent}>
      <Text style={styles.statusText}>No videos available.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <View style={styles.screen}>
        <View style={styles.content}>
          {loading && renderLoading()}
          {!loading && error && renderError()}
          {!loading && !error && feedItems.length === 0 && renderEmptyState()}
          {!loading && !error && feedItems.length > 0 && (
            <FlatList
              ref={flatListRef}
              data={feedItems}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              pagingEnabled
              snapToInterval={height}
              snapToAlignment="start"
              decelerationRate="fast"
              showsVerticalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
              initialNumToRender={3}
              maxToRenderPerBatch={3}
              windowSize={5}
              removeClippedSubviews
              getItemLayout={(_, index) => ({
                length: height,
                offset: height * index,
                index,
              })}
              refreshing={refreshing}
              onRefresh={handleRefresh}
              onScrollToIndexFailed={handleScrollToIndexFailed}
            />
          )}
        </View>

        <View style={styles.headerOverlay}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{headerTitle}</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    marginTop: 12,
    color: "#F3F4F6",
    textAlign: "center",
  },
  errorText: {
    marginTop: 12,
    color: "#F87171",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  retryText: {
    color: "#fff",
    fontWeight: "600",
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 6,
    borderRadius: 999,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 28,
  },
});

export default UserFeedScreen;
