import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  FlatList,
  Dimensions,
  ViewToken,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { setVideos } from "../../Store/videoSlice";
import Post from "../../Components/Post";
import type { RootState } from "../../Store/index";
import type { Video } from "../../Store/videoSlice";
import videoData from "./apiVideo";

const { height } = Dimensions.get("screen");
const SCROLL_THRESHOLD = height / 2;

interface ViewableItemsChanged {
  viewableItems: ViewToken[];
  changed: ViewToken[];
}

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
  }, []);

  const handleScrollBegin = useCallback(
    (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      scrollStartOffset.current = event.nativeEvent.contentOffset.y;
      isManualScrolling.current = true;
    },
    []
  );

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

  const handleScrollEnd = useCallback(() => {
    isManualScrolling.current = false;
    flatListRef.current?.scrollToIndex({
      index: currentIndex,
      animated: true,
      viewPosition: 0,
    });
  }, [currentIndex]);

  const getItemLayout = useCallback(
    (
      _data: Array<Video> | null | undefined,
      index: number
    ): GetItemLayoutData => ({
      length: height,
      offset: height * index,
      index,
    }),
    []
  );

  const renderItem = useCallback(
    ({ item, index }: { item: Video; index: number }) => (
      <Post video={item} isActive={index === currentIndex} />
    ),
    [currentIndex]
  );

  const keyExtractor = useCallback((item: Video) => item.id, []);

  const handleScrollToIndexFailed = useCallback(
    (info: ScrollToIndexFailInfo) => {
      const wait = new Promise((resolve) => setTimeout(resolve, 100));
      wait.then(() => {
        flatListRef.current?.scrollToIndex({
          index: info.index,
          animated: true,
          viewPosition: 0,
        });
      });
    },
    []
  );

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
      decelerationRate={0.9}
      bounces={false}
      onScrollBeginDrag={handleScrollBegin}
      onScroll={handleScroll}
      onMomentumScrollEnd={handleScrollEnd}
      scrollEventThrottle={16}
      initialNumToRender={2}
      maxToRenderPerBatch={2}
      windowSize={3}
      removeClippedSubviews={true}
      getItemLayout={getItemLayout}
      maintainVisibleContentPosition={{
        minIndexForVisible: 0,
        autoscrollToTopThreshold: 1,
      }}
      onScrollToIndexFailed={handleScrollToIndexFailed}
    />
  );
}
