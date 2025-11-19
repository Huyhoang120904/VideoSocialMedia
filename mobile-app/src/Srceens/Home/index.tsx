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
import { fetchFeedItems } from "../../Services/FeedService";
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

  // Function to reload when clicking on active tab - scroll to top first
  const reloadFromTabClick = useCallback(async () => {
    // Scroll về đầu danh sách để thấy refresh indicator
    if (flatListRef.current && feedItems.length > 0) {
      flatListRef.current.scrollToOffset({ offset: 0, animated: true });
      // Delay một chút để animation scroll hoàn thành
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    // Sau đó mới trigger refresh
    await refreshVideos();
  }, [refreshVideos, feedItems.length]);

  // Load videos chỉ 1 lần khi component mount
  useEffect(() => {
    if (!hasLoaded) {
      console.log('=== Home: Initial load ===');
      loadVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency - only run once on mount

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

  // Top tabs logic
  const tabs = ["Khám phá", "Bạn bè", "Đã follow", "Đề xuất"] as const;
  type TabType = (typeof tabs)[number];
  const [activeTab, setActiveTab] = useState<TabType>("Đề xuất");

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

  const renderContent = () => {
    switch (activeTab) {
      case "Khám phá":
        return <ExploreScreen />;
      case "Bạn bè":
      case "Đã follow":
        return <ExploreScreen />;
      case "Đề xuất":
        if (loading) {
          return (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#fff" />
              <Text style={styles.loadingText}>Đang tải video...</Text>
            </View>
          );
        }

        if (error) {
          return (
            <View style={styles.centerContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <Text style={styles.retryText} onPress={loadVideos}>
                Thử lại
              </Text>
            </View>
          );
        }

        if (feedItems.length === 0) {
          return (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Không có nội dung nào</Text>
            </View>
          );
        }

        return (
          <FlatList<FeedItem>
            ref={flatListRef}
            data={feedItems}
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
            refreshing={refreshing}
            onRefresh={refreshVideos}
          />
        );
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
