// Home.tsx - TikTok-like scrolling behavior
import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  FlatList,
  Dimensions,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
  View,
  PanResponder,
  ActivityIndicator,
  Text,
  StyleSheet,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setVideos, Video } from "../../store/videoSlice";
import Post from "../../Components/Post";
import type { RootState } from "../../store/index";
import { fetchVideos } from "../../Services/VideoService";
import TopVideo from "../../Components/Post/TopVideo";
import ExploreScreen from "./ExploreScreen";

const { height, width } = Dimensions.get("window");
const SCROLL_THRESHOLD = 50; // Ngưỡng để chuyển video

interface GetItemLayoutData {
  length: number;
  offset: number;
  index: number;
}

interface ScrollToIndexFailInfo {
  index: number;
  highestMeasuredFrameIndex: number;
  averageItemLength: number;
}

export default function Home() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const flatListRef = useRef<FlatList<Video>>(null);
  const videos = useSelector((state: RootState) => state.videos.videos);
  const dispatch = useDispatch();

  const scrollStartOffset = useRef(0);
  const isManualScrolling = useRef(false);

  const loadVideos = useCallback(async () => {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetchVideos();
      if (response.code === 200 && response.result) {
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
  }, [dispatch, loading]);

  useEffect(() => {
    if (videos.length === 0) {
      loadVideos();
    }
  }, [videos.length, loadVideos]);

  // Bắt đầu scroll
  const handleScrollBegin = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollStartOffset.current = event.nativeEvent.contentOffset.y;
      isManualScrolling.current = true;
    },
    []
  );

  // Xử lý khi scroll
  const handleScroll = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (!isManualScrolling.current) return;

      const currentOffset = event.nativeEvent.contentOffset.y;
      const diff = currentOffset - scrollStartOffset.current;
      const nextIndex = Math.round(currentOffset / height);

      if (Math.abs(diff) >= SCROLL_THRESHOLD) {
        let targetIndex = currentIndex;

        if (diff > 0 && nextIndex > currentIndex) {
          targetIndex = Math.min(currentIndex + 1, videos.length - 1);
        } else if (diff < 0 && nextIndex < currentIndex) {
          targetIndex = Math.max(currentIndex - 1, 0);
        }

        if (targetIndex !== currentIndex) {
          setCurrentIndex(targetIndex);
          flatListRef.current?.scrollToIndex({
            index: targetIndex,
            animated: true,
            viewPosition: 0,
          });
        }
      }
    },
    [currentIndex, videos.length]
  );

  // Kết thúc scroll
  const handleScrollEnd = useCallback(() => {
    isManualScrolling.current = false;
    flatListRef.current?.scrollToIndex({
      index: currentIndex,
      animated: true,
      viewPosition: 0,
    });
  }, [currentIndex]);

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
        isActive={index === currentIndex}
        itemHeight={height}
      />
    ),
    [currentIndex, height]
  );

  const keyExtractor = useCallback((item: Video) => item.id, []);

  const handleScrollToIndexFailed = useCallback(
    (info: ScrollToIndexFailInfo) => {
      setTimeout(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0,
        });
      }, 100);
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
            onScrollBeginDrag={handleScrollBegin}
            onScroll={handleScroll}
            onMomentumScrollEnd={handleScrollEnd}
            scrollEventThrottle={16}
            initialNumToRender={2}
            maxToRenderPerBatch={2}
            windowSize={3}
            removeClippedSubviews
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
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 20,
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 10,
    textAlign: 'center',
  },
  errorText: {
    color: '#ff4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
  },
  retryText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    backgroundColor: '#333',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  emptyText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});
