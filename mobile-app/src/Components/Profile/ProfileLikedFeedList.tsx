import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import FeedPost from "../Post/FeedPost";
import { FeedItem } from "../../Store/feedSlice";
import { ProfileLikedEmptyState } from "./ProfileLikedEmptyState";
import { recordFeedItemView } from "../../Services/FeedService";

interface ProfileLikedFeedListProps {
  headerComponent: React.ReactNode;
  feedItems: FeedItem[];
  isLoading: boolean;
  error?: string | null;
  onRetry?: () => void;
  initialFeedItemId?: string;
}

const { height: windowHeight } = Dimensions.get("window");

export const ProfileLikedFeedList: React.FC<ProfileLikedFeedListProps> = ({
  headerComponent,
  feedItems,
  isLoading,
  error,
  onRetry,
  initialFeedItemId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const watchedFeedItemsRef = useRef<Set<string>>(new Set());
  const flatListRef = useRef<FlatList<FeedItem>>(null);
  const [hasAppliedInitialScroll, setHasAppliedInitialScroll] = useState(false);

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: Array<{ index: number | null }>;
    }) => {
      if (!viewableItems || viewableItems.length === 0) {
        return;
      }

      const nextIndex = viewableItems[0]?.index;
      if (typeof nextIndex === "number" && nextIndex !== currentIndex) {
        setCurrentIndex(nextIndex);
      }
    }
  ).current;

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 80,
    }),
    []
  );

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

    recordFeedItemView(feedItemId).catch(() => {
      watchedFeedItemsRef.current.delete(feedItemId);
    });
  }, [currentIndex, feedItems]);

  useEffect(() => {
    setHasAppliedInitialScroll(false);
  }, [initialFeedItemId]);

  useEffect(() => {
    if (
      !initialFeedItemId ||
      hasAppliedInitialScroll ||
      feedItems.length === 0
    ) {
      return;
    }

    const targetIndex = feedItems.findIndex(
      (feedItem) => feedItem.id === initialFeedItemId
    );

    if (targetIndex === -1) {
      return;
    }

    requestAnimationFrame(() => {
      flatListRef.current?.scrollToIndex({
        index: targetIndex,
        animated: false,
      });
      setCurrentIndex(targetIndex);
      setHasAppliedInitialScroll(true);
    });
  }, [feedItems, initialFeedItemId, hasAppliedInitialScroll]);

  const renderItem = useCallback(
    ({ item, index }: { item: FeedItem; index: number }) => (
      <FeedPost
        feedItem={item}
        isActive={index === currentIndex}
        itemHeight={windowHeight}
      />
    ),
    [currentIndex]
  );

  const keyExtractor = useCallback((item: FeedItem) => item.id, []);
  const handleScrollToIndexFailed = useCallback(
    (info: { index: number }) => {
      if (!flatListRef.current) {
        return;
      }

      const clampedIndex = Math.min(
        info.index,
        Math.max(feedItems.length - 1, 0)
      );

      if (clampedIndex >= 0) {
        flatListRef.current.scrollToIndex({
          index: clampedIndex,
          animated: false,
        });
        setCurrentIndex(clampedIndex);
        setHasAppliedInitialScroll(true);
      }
    },
    [feedItems.length]
  );

  const renderEmptyState = () => (
    <View className="flex-1 justify-center items-center px-6 py-10 bg-black">
      <ProfileLikedEmptyState
        title={error ? "Unable to load liked videos" : undefined}
        description={
          error ||
          "Videos you love will appear here. Tap the heart icon on posts you enjoy."
        }
      />
      {error && onRetry && (
        <TouchableOpacity
          onPress={onRetry}
          className="mt-4 px-6 py-3 bg-white rounded-full"
          activeOpacity={0.8}
        >
          <Text className="text-gray-900 font-semibold">Try again</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View className="flex-1 bg-black">
      <View className="bg-white">{headerComponent}</View>

      <View className="flex-1">
        {isLoading && feedItems.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#ff0050" />
            <Text className="text-gray-100 mt-4">Loading liked videos...</Text>
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={feedItems}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            pagingEnabled
            snapToInterval={windowHeight}
            snapToAlignment="start"
            decelerationRate="fast"
            showsVerticalScrollIndicator={false}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}
            onScrollToIndexFailed={handleScrollToIndexFailed}
            getItemLayout={(_, index) => ({
              length: windowHeight,
              offset: windowHeight * index,
              index,
            })}
            ListEmptyComponent={!isLoading ? renderEmptyState : null}
            refreshing={isLoading && feedItems.length > 0}
            onRefresh={onRetry}
          />
        )}
      </View>
    </View>
  );
};

