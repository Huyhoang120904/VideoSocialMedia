// Home.tsx - TikTok-like scrolling behavior
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  FlatList,
  Dimensions,
  ViewToken,
  View,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setVideos, Video } from "../../Store/videoSlice";
import Post from "../../Components/Post";
import type { RootState } from "../../Store/index";
import { fetchVideos } from "../../Services/VideoService";
import TopVideo from "../../Components/Post/TopVideo";
import ExploreScreen from "./ExploreScreen";
import { useFocusEffect, useRoute } from "@react-navigation/native";

const { height, width } = Dimensions.get("window");

interface ScrollToIndexFailInfo {
  index: number;
  highestMeasuredFrameIndex: number;
  averageItemLength: number;
}

export default function Home() {
  const route = useRoute();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isTabActive, setIsTabActive] = useState(true);
  const flatListRef = useRef<FlatList<Video>>(null);
  const videos = useSelector((state: RootState) => state.videos.videos);
  const dispatch = useDispatch();

  const isScrolling = useRef(false);
  const scrollDirection = useRef<"up" | "down" | null>(null);
  const lastScrollY = useRef(0);
  const hasScrolledToVideo = useRef(false);

  const loadVideos = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchVideos();

      if (response.code === 1000 && response.result) {
        dispatch(setVideos(response.result));
      } else {
        setError(response.message || "Failed to load videos");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred while loading videos");
      console.error("Error loading videos:", err);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  // Load videos lần đầu
  useEffect(() => {
    if (videos.length === 0 && !loading) {
      loadVideos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videos.length]);

  // Handle tab focus/blur to pause/resume video
  useFocusEffect(
    useCallback(() => {
      setIsTabActive(true);

      if (videos.length === 0 && !loading) {
        loadVideos();
      }

      return () => {
        setIsTabActive(false);
        hasScrolledToVideo.current = false; // Reset khi rời tab
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videos.length, loading])
  );

  // Scroll to specific video if videoId is provided
  useEffect(() => {
    const params = route.params as any;
    if (
      params?.videoId &&
      videos.length > 0 &&
      !hasScrolledToVideo.current &&
      isTabActive
    ) {
      const videoIndex = videos.findIndex((v) => v.id === params.videoId);
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
  }, [route.params, videos, isTabActive]);

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
      newIndex = Math.min(currentIndex + 1, videos.length - 1);
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
  }, [currentIndex, videos.length]);

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
    (_data: ArrayLike<Video> | null | undefined, index: number) => ({
      length: height,
      offset: height * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Video; index: number }) => (
      <Post
        video={item}
        isActive={index === currentIndex && isTabActive}
        itemHeight={height}
      />
    ),
    [currentIndex, isTabActive]
  );

  const keyExtractor = useCallback((item: Video) => item.id, []);

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

        if (videos.length === 0) {
          return (
            <View style={styles.centerContainer}>
              <Text style={styles.emptyText}>Không có video nào</Text>
            </View>
          );
        }

        return (
          <FlatList<Video>
            ref={flatListRef}
            data={videos}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            showsVerticalScrollIndicator={false}
            pagingEnabled
            snapToInterval={height}
            snapToAlignment="start"
            decelerationRate="fast"
            bounces={false}
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
          />
        );
      default:
        return null;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TopVideo activeTab={activeTab} setActiveTab={setActiveTab} />
      {renderContent()}
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
});
