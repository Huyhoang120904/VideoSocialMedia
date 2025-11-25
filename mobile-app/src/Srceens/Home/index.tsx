// Home.tsx - TikTok-like scrolling behavior with Feed support
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  FlatList,
  Dimensions,
  ViewToken,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
  PanResponder,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setFeedItems, FeedItem } from "../../Store/feedSlice";
import FeedPost from "../../Components/Post/FeedPost";
import type { RootState } from "../../Store/index";
import {
  fetchFeedItems,
  fetchExploreFeedItems,
  fetchFollowingFeedItems,
  fetchFriendsFeedItems,
  recordFeedItemView,
} from "../../Services/FeedService";
import TopVideo from "../../Components/Post/TopVideo";
import ExploreScreen from "./ExploreScreen";
import { useFocusEffect, useRoute, useNavigation } from "@react-navigation/native";
// import { useAppDimensions } from "../../Utils/getDimensions";

const { height, width } = Dimensions.get("window");

interface ScrollToIndexFailInfo {
  index: number;
  highestMeasuredFrameIndex: number;
  averageItemLength: number;
}

export default function Home() {
  const route = useRoute();
  const navigation = useNavigation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState(false);
  const [isOptionsModalOpen, setIsOptionsModalOpen] = useState(false);
  const [imageSlideInfo, setImageSlideInfo] = useState<{ currentIndex: number; totalImages: number } | null>(null);
  const flatListRef = useRef<FlatList<FeedItem>>(null);
  const feedItems = useSelector((state: RootState) => state.feed.feedItems);
  const dispatch = useDispatch();
  const [exploreFeedItems, setExploreFeedItems] = useState<FeedItem[]>([]);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreRefreshing, setExploreRefreshing] = useState(false);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [exploreHasLoaded, setExploreHasLoaded] = useState(false);
  const exploreLoadingRef = useRef(false);
  const [followingFeed, setFollowingFeed] = useState<FeedItem[]>([]);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [followingRefreshing, setFollowingRefreshing] = useState(false);
  const [followingError, setFollowingError] = useState<string | null>(null);
  const [followingHasLoaded, setFollowingHasLoaded] = useState(false);
  const followingLoadingRef = useRef(false);
  
  const [friendsFeed, setFriendsFeed] = useState<FeedItem[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(false);
  const [friendsRefreshing, setFriendsRefreshing] = useState(false);
  const [friendsError, setFriendsError] = useState<string | null>(null);
  const [friendsHasLoaded, setFriendsHasLoaded] = useState(false);
  const friendsLoadingRef = useRef(false);

  // Top tabs logic - khai báo sớm để dùng trong useEffect
  const tabs = ["Khám phá", "Bạn bè", "Đã follow", "Đề xuất"] as const;
  type TabType = (typeof tabs)[number];
  const [activeTab, setActiveTab] = useState<TabType>("Đề xuất");
  const watchedFeedItemsRef = useRef<Set<string>>(new Set());

  // Log dimensions
  // const dimensions = useAppDimensions();


  const isScrolling = useRef(false);
  const scrollDirection = useRef<"up" | "down" | null>(null);
  const lastScrollY = useRef(0);
  const hasScrolledToVideo = useRef(false);
  const isLoadingRef = useRef(false);

  const loadVideos = useCallback(async () => {
    // Prevent multiple simultaneous loads
    if (isLoadingRef.current || hasLoaded) {
      console.log('=== Home: Skipping load (already loading or loaded) ===');
      return;
    }

    isLoadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const response = await fetchFeedItems();

      if (response.code === 1000 && response.result) {

        dispatch(setFeedItems(response.result));
        setHasLoaded(true);
      } else {
        setError(response.message || "Failed to load feed items");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading feed items");
      console.error("Error loading feed:", err);
    } finally {
      setLoading(false);
      isLoadingRef.current = false;
    }
  }, [dispatch, hasLoaded]); // Removed loading from dependencies

  const loadExploreFeed = useCallback(
    async (force = false) => {
      if (exploreLoadingRef.current || (exploreHasLoaded && !force)) {
        return;
      }

      exploreLoadingRef.current = true;
      setExploreLoading(true);
      setExploreError(null);

      try {
        const response = await fetchExploreFeedItems({ size: 40 });
        console.log("🔍 Explore feed response:", {
          code: response.code,
          hasResult: !!response.result,
          resultLength: response.result?.length || 0,
          message: response.message,
        });
        
        if (response.code === 1000) {
          const items = response.result || [];
          setExploreFeedItems(items);
          setExploreHasLoaded(true);
          console.log("✅ Explore feed loaded:", items.length, "items");
          if (items.length === 0) {
            console.warn("⚠️ Explore feed is empty");
          }
        } else {
          const errorMsg = response.message || "Không thể tải nội dung khám phá";
          console.error("❌ Explore feed error:", errorMsg, response);
          setExploreError(errorMsg);
        }
      } catch (err: any) {
        console.error("❌ Explore feed exception:", err);
        setExploreError(err.message || "Không thể tải nội dung khám phá");
      } finally {
        setExploreLoading(false);
        exploreLoadingRef.current = false;
      }
    },
    [exploreHasLoaded]
  );

  const loadFollowingFeed = useCallback(
    async (force = false) => {
      console.log("🚀 loadFollowingFeed called, force:", force, "followingLoadingRef:", followingLoadingRef.current);
      
      if (followingLoadingRef.current) {
        console.log("⏭️ Already loading, skip");
        return;
      }

      followingLoadingRef.current = true;
      setFollowingLoading(true);
      setFollowingError(null);

      try {
        console.log("📡 Fetching following feed...");
        const response = await fetchFollowingFeedItems({ size: 50 });
        console.log("📥 Following feed response:", {
          code: response.code,
          hasResult: !!response.result,
          resultLength: response.result?.length || 0,
        });
        if (response.code === 1000) {
          const items = response.result || [];
          console.log("✅ Setting followingFeed with", items.length, "items");
          setFollowingFeed(items);
          setFollowingHasLoaded(true);
        } else {
          console.error("❌ Following feed error code:", response.code, response.message);
          setFollowingError(response.message || "Không thể tải feed đã follow");
        }
      } catch (err: any) {
        console.error("❌ Following feed exception:", err);
        setFollowingError(err.message || "Không thể tải feed đã follow");
      } finally {
        setFollowingLoading(false);
        followingLoadingRef.current = false;
      }
    },
    []
  );

  const recordViewForFeedItem = useCallback(async (feedItemId: string) => {
    if (!feedItemId) {
      return;
    }

    if (watchedFeedItemsRef.current.has(feedItemId)) {
      return;
    }

    watchedFeedItemsRef.current.add(feedItemId);

    try {
      await recordFeedItemView(feedItemId);
    } catch (error) {
      console.warn("Failed to record view for feed item:", feedItemId, error);
      watchedFeedItemsRef.current.delete(feedItemId);
    }
  }, []);

  // Function to refresh videos (for pull-to-refresh)
  const refreshVideos = useCallback(async () => {
    setRefreshing(true);
    setHasLoaded(false);
    setError(null);

    // Thêm delay tối thiểu để người dùng thấy rõ indicator
    const startTime = Date.now();
    const minDelay = 500; // 800ms tối thiểu

    try {
      console.log('=== Home: Manual refresh triggered ===');
      const response = await fetchFeedItems();

      if (response.code === 1000 && response.result) {
        dispatch(setFeedItems(response.result));
        setHasLoaded(true);
      } else {
        setError(response.message || "Failed to load feed items");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading feed items");
      console.error("Error refreshing feed:", err);
    } finally {
      // Đảm bảo indicator hiển thị ít nhất minDelay ms
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, minDelay - elapsed);

      if (remaining > 0) {
        await new Promise(resolve => setTimeout(resolve, remaining));
      }

      setRefreshing(false);
    }
  }, [dispatch]);

  const refreshExploreFeed = useCallback(async () => {
    setExploreRefreshing(true);
    setExploreHasLoaded(false);
    try {
      await loadExploreFeed(true);
    } finally {
      setExploreRefreshing(false);
    }
  }, [loadExploreFeed]);

  const refreshFollowingFeed = useCallback(async () => {
    setFollowingRefreshing(true);
    setFollowingHasLoaded(false);
    followingLoadingRef.current = false;
    try {
      await loadFollowingFeed(true);
    } finally {
      setFollowingRefreshing(false);
    }
  }, [loadFollowingFeed]);

  const loadFriendsFeed = useCallback(
    async (force = false) => {
      console.log("🚀 loadFriendsFeed called, force:", force, "friendsLoadingRef:", friendsLoadingRef.current, "friendsHasLoaded:", friendsHasLoaded);
      
      if (friendsLoadingRef.current) {
        console.log("⏭️ Already loading, skip");
        return;
      }
      
      if (friendsHasLoaded && !force) {
        console.log("⏭️ Already loaded and not force, skip");
        return;
      }

      friendsLoadingRef.current = true;
      setFriendsLoading(true);
      setFriendsError(null);

      try {
        console.log("📡 Fetching friends feed...");
        const response = await fetchFriendsFeedItems({ size: 50 });
        console.log("📥 Friends feed response:", {
          code: response.code,
          hasResult: !!response.result,
          resultLength: response.result?.length || 0,
        });
        if (response.code === 1000) {
          const items = response.result || [];
          console.log("✅ Setting friendsFeed with", items.length, "items");
          setFriendsFeed(items);
          setFriendsHasLoaded(true);
        } else {
          console.error("❌ Friends feed error code:", response.code, response.message);
          setFriendsError(response.message || "Không thể tải feed bạn bè");
        }
      } catch (err: any) {
        console.error("❌ Friends feed exception:", err);
        setFriendsError(err.message || "Không thể tải feed bạn bè");
      } finally {
        setFriendsLoading(false);
        friendsLoadingRef.current = false;
      }
    },
    [friendsHasLoaded]
  );

  const refreshFriendsFeed = useCallback(async () => {
    setFriendsRefreshing(true);
    setFriendsHasLoaded(false);
    friendsLoadingRef.current = false;
    try {
      await loadFriendsFeed(true);
    } finally {
      setFriendsRefreshing(false);
    }
  }, [loadFriendsFeed]);

  // Function to reload when clicking on active tab - scroll to top first
  const reloadFromTabClick = useCallback(async () => {
    if (activeTab === "Khám phá") {
      await refreshExploreFeed();
      return;
    }

    const currentListLength =
      (activeTab === "Đã follow" || activeTab === "Bạn bè")
        ? followingFeed.length 
        : feedItems.length;

    if (
      (activeTab === "Đề xuất" || activeTab === "Đã follow" || activeTab === "Bạn bè") &&
      flatListRef.current &&
      currentListLength > 0
    ) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (activeTab === "Đã follow" || activeTab === "Bạn bè") {
      await refreshFollowingFeed();
      return;
    }

    if (activeTab === "Đề xuất") {
      await refreshVideos();
    }
  }, [
    activeTab,
    feedItems.length,
    followingFeed.length,
    friendsFeed.length,
    refreshExploreFeed,
    refreshFollowingFeed,
    refreshFriendsFeed,
    refreshVideos,
  ]);

  // Load videos chỉ 1 lần khi component mount
  useEffect(() => {
    if (!hasLoaded) {
      console.log('=== Home: Initial load ===');
      loadVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run once on mount

  useEffect(() => {
    if (activeTab === "Khám phá" && !exploreHasLoaded && !exploreLoadingRef.current) {
      loadExploreFeed();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, exploreHasLoaded]);

  useEffect(() => {
    if (activeTab === "Đã follow" || activeTab === "Bạn bè") {
      // Force load mỗi lần chuyển tab
      if (!followingLoadingRef.current) {
        loadFollowingFeed(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Handle tab focus/blur to pause/resume video
  useFocusEffect(
    useCallback(() => {
      console.log('=== Home: Tab focused ===');
      setIsTabActive(true);

      return () => {
        console.log('=== Home: Tab blurred ===');
        setIsTabActive(false);
        hasScrolledToVideo.current = false;
      };
    }, []) // Empty dependencies - never reload
  );

  // Listen for tab reload event (when clicking on active tab)
  useEffect(() => {
    const unsubscribe = navigation.addListener('tabLongPress' as any, () => {
      console.log('🔄 Tab reload triggered - refreshing videos');
      refreshVideos();
    });

    return unsubscribe;
  }, [navigation, refreshVideos]);

  // Scroll to specific video if videoId is provided
  useEffect(() => {
    const params = route.params as any;
    if (
      params?.videoId &&
      feedItems.length > 0 &&
      !hasScrolledToVideo.current &&
      isTabActive
    ) {
      const videoIndex = feedItems.findIndex((item) => item.id === params.videoId);
      if (videoIndex !== -1) {
        hasScrolledToVideo.current = true;
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
            index: videoIndex,
            animated: false,
          });
          setCurrentIndex(videoIndex);
        }, 100);
      }
    }
  }, [route.params, feedItems, isTabActive]);

  useEffect(() => {
    setCurrentIndex(0);
    setImageSlideInfo(null);
  }, [activeTab]);

  useEffect(() => {
    let items: FeedItem[] | null = null;

    if (activeTab === "Đề xuất") {
      items = feedItems;
    } else if (activeTab === "Đã follow" || activeTab === "Bạn bè") {
      items = followingFeed;
    } else {
      return;
    }

    if (!items || items.length === 0) {
      return;
    }

    const safeIndex = Math.min(currentIndex, items.length - 1);
    const activeItem = items[safeIndex];

    if (!activeItem) {
      return;
    }

    recordViewForFeedItem(activeItem.id);
  }, [activeTab, currentIndex, feedItems, followingFeed, recordViewForFeedItem]);

  // Xử lý scroll để giới hạn 1 video mỗi lần
  const handleScrollBeginDrag = useCallback((event: any) => {
    isScrolling.current = true;
    lastScrollY.current = event.nativeEvent.contentOffset.y;
    scrollDirection.current = null;
  }, []);

  const handleScroll = useCallback((event: any) => {
    if (!isScrolling.current) return;

    const currentY = event.nativeEvent.contentOffset.y;
    const diff = currentY - lastScrollY.current;

    if (Math.abs(diff) > 10) {
      scrollDirection.current = diff > 0 ? "down" : "up";
    }
  }, []);

  const handleScrollEndDrag = useCallback(() => {
    if (!scrollDirection.current) {
      // Nếu không có scroll direction rõ ràng, snap về vị trí hiện tại
      flatListRef.current?.scrollToIndex({
        index: currentIndex,
        animated: true,
      });
      isScrolling.current = false;
      return;
    }

    // Tính toán index mới (chỉ cho phép +1 hoặc -1)
    let newIndex = currentIndex;
    if (scrollDirection.current === "down") {
      newIndex = Math.min(currentIndex + 1, feedItems.length - 1);
    } else if (scrollDirection.current === "up") {
      newIndex = Math.max(currentIndex - 1, 0);
    }

    // Scroll đến video mới
    flatListRef.current?.scrollToIndex({
      index: newIndex,
      animated: true,
    });

    setCurrentIndex(newIndex);
    isScrolling.current = false;
    scrollDirection.current = null;
  }, [currentIndex, feedItems.length]);

  // Xử lý khi item hiển thị thay đổi
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (
        !isScrolling.current &&
        viewableItems.length > 0 &&
        viewableItems[0].index !== null
      ) {
        setCurrentIndex(viewableItems[0].index);
      }
    }
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const getItemLayout = useCallback(
    (_data: ArrayLike<FeedItem> | null | undefined, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    []
  );

  const handleImageSlideChange = useCallback((currentIndex: number, totalImages: number) => {
    if (currentIndex >= 0 && totalImages > 0) {
      setImageSlideInfo({ currentIndex, totalImages });
    } else {
      setImageSlideInfo(null);
    }
  }, []);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => (
      <FeedPost
        feedItem={item}
        isActive={index === currentIndex && isTabActive}
        itemHeight={height}
        onCommentModalChange={setIsCommentModalOpen}
        onOptionsModalChange={setIsOptionsModalOpen}
        onImageSlideChange={handleImageSlideChange}
      />
    ),
    [currentIndex, isTabActive, handleImageSlideChange]
  );

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);

  const handleScrollToIndexFailed = useCallback(
    (info: ScrollToIndexFailInfo) => {
      const wait = new Promise((resolve) => setTimeout(resolve, 500));
      wait.then(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: false,
        });
      });
    },
    []
  );

  // activeTab và tabs đã được khai báo ở trên

  // PanResponder để xử lý swipe ngang giữa các tab
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Chỉ kích hoạt khi swipe ngang mạnh hơn swipe dọc và đủ xa
        const isHorizontal = Math.abs(gestureState.dx) > Math.abs(gestureState.dy) * 1.5;
        const isSignificant = Math.abs(gestureState.dx) > 30;
        
        if (isHorizontal && isSignificant) {
          console.log('Detecting horizontal swipe:', gestureState.dx);
          return true;
        }
        return false;
      },
      onPanResponderGrant: () => {
        console.log('Pan responder granted');
      },
      onPanResponderRelease: (evt, gestureState) => {
        const currentIndex = tabs.indexOf(activeTab);
        const swipeThreshold = 40;

        console.log('Pan responder release, dx:', gestureState.dx);

        if (gestureState.dx > swipeThreshold) {
          // Swipe right - chuyển sang tab bên trái (previous)
          if (currentIndex > 0) {
            const newTab = tabs[currentIndex - 1];
            console.log('✅ Home swipe right: switching to', newTab);
            setActiveTab(newTab);
          } else {
            console.log('❌ Already at first tab');
          }
        } else if (gestureState.dx < -swipeThreshold) {
          // Swipe left - chuyển sang tab bên phải (next)
          if (currentIndex < tabs.length - 1) {
            const newTab = tabs[currentIndex + 1];
            console.log('✅ Home swipe left: switching to', newTab);
            setActiveTab(newTab);
          } else {
            console.log('❌ Already at last tab');
          }
        }
      },
      onPanResponderTerminate: () => {
        console.log('Pan responder terminated');
      },
    })
  ).current;

  const renderVerticalFeedBlock = ({
    items,
    loadingState,
    errorState,
    emptyMessage,
    refreshingState,
    onRefresh,
    onRetry,
  }: {
    items: FeedItem[];
    loadingState: boolean;
    errorState: string | null;
    emptyMessage: string;
    refreshingState: boolean;
    onRefresh: () => Promise<void>;
    onRetry: () => void;
  }) => {
    console.log("🎨 renderVerticalFeedBlock:", {
      itemsLength: items.length,
      loadingState,
      errorState,
      emptyMessage,
    });
    
    if (loadingState) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Đang tải video...</Text>
        </View>
      );
    }

    if (errorState) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>❌ {errorState}</Text>
          <Text style={styles.retryText} onPress={onRetry}>
            Thử lại
          </Text>
        </View>
      );
    }

    if (items.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        </View>
      );
    }

    return (
      <FlatList<FeedItem>
        ref={flatListRef}
        data={items}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsVerticalScrollIndicator={false}
        pagingEnabled
        snapToInterval={height}
        snapToAlignment="start"
        decelerationRate="fast"
        bounces={true}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        scrollEventThrottle={16}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        initialNumToRender={3}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews={true}
        getItemLayout={getItemLayout}
        onScrollToIndexFailed={handleScrollToIndexFailed}
        refreshing={refreshingState}
        onRefresh={() => {
          onRefresh();
        }}
      />
    );
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Khám phá":
        return (
          <ExploreScreen
            data={exploreFeedItems}
            loading={exploreLoading}
            error={exploreError}
            refreshing={exploreRefreshing}
            onRefresh={refreshExploreFeed}
            onRetry={() => loadExploreFeed(true)}
          />
        );
      case "Bạn bè":
        return renderVerticalFeedBlock({
          items: followingFeed,
          loadingState: followingLoading,
          errorState: followingError,
          emptyMessage:
            "Theo dõi thêm người dùng để khám phá nội dung tại đây.",
          refreshingState: followingRefreshing,
          onRefresh: refreshFollowingFeed,
          onRetry: () => loadFollowingFeed(true),
        });
      case "Đã follow":
        return renderVerticalFeedBlock({
          items: followingFeed,
          loadingState: followingLoading,
          errorState: followingError,
          emptyMessage:
            "Theo dõi thêm người dùng để khám phá nội dung tại đây.",
          refreshingState: followingRefreshing,
          onRefresh: refreshFollowingFeed,
          onRetry: () => loadFollowingFeed(true),
        });
      case "Đề xuất":
        return renderVerticalFeedBlock({
          items: feedItems,
          loadingState: loading,
          errorState: error,
          emptyMessage: "Không có nội dung nào",
          refreshingState: refreshing,
          onRefresh: refreshVideos,
          onRetry: loadVideos,
        });
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }} {...panResponder.panHandlers}>
      {!isCommentModalOpen && !isOptionsModalOpen && (
        <TopVideo
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onReloadCurrentTab={reloadFromTabClick}
          imageSlideInfo={imageSlideInfo}
        />
      )}
      {renderContent()}

      {/* Debug overlays (only shown in development). Hidden in production so
          they don't reserve layout space or interfere with bottomVideo */}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
    paddingHorizontal: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 10,
    textAlign: "center",
  },
  errorText: {
    color: "#ff4444",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 10,
  },
  retryText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    backgroundColor: "#333",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
  debugOverlay: {
    position: "absolute",
    top: 100,
    right: 16,
    zIndex: 1000,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    padding: 12,
    borderRadius: 8,
    minWidth: 200,
  },
  debugItem: {
    padding: 8,
    marginBottom: 8,
    borderRadius: 6,
    borderWidth: 2,
  },
  debugLabel: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  debugValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
