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
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setVideos, Video } from "../../Store/videoSlice";
import Post from "../../Components/Post";
import type { RootState } from "../../Store/index";

import videoData from "./apiVideo";
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
  const flatListRef = useRef<FlatList<Video>>(null);
  const videos = useSelector((state: RootState) => state.videos.videos);
  const dispatch = useDispatch();

  const scrollStartOffset = useRef(0);
  const isManualScrolling = useRef(false);

  useEffect(() => {
    if (videos.length === 0) {
      dispatch(setVideos(videoData));
    }
  }, [videos, dispatch]);

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
