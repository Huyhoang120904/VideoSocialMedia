import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, View, Dimensions } from "react-native";
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { StackNavigationProp } from "@react-navigation/stack";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { FeedItem } from "../../Store/feedSlice";
import { AuthedStackParamList } from "../../Types/response/navigation.types";
import { fetchLovedFeedPage } from "../../Services/FeedService";
import VerticalFeedList from "../../Components/Feed/VerticalFeedList";
import FeedHeader from "../../Components/Feed/FeedHeader";
import QuickCommentBar from "../../Components/Feed/QuickCommentBar";
import VideoCommentModal from "../../Components/Comment/VideoCommentModal";
import { useAuth } from "../../Context/AuthProvider";
import commentService from "../../Services/CommentService";

type LikedFeedNavigationProp = StackNavigationProp<
  AuthedStackParamList,
  "LikedFeed"
>;

type LikedFeedRouteProp = RouteProp<AuthedStackParamList, "LikedFeed">;

const LikedFeedScreen = () => {
  const navigation = useNavigation<LikedFeedNavigationProp>();
  const route = useRoute<LikedFeedRouteProp>();
  const { user } = useAuth(); // Assuming useAuth returns user object now, or we need to fetch it

  const initialFeedItemId = route.params?.initialFeedItemId;

  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentFeedItem, setCurrentFeedItem] = useState<FeedItem | null>(null);
  const [isCommentModalVisible, setIsCommentModalVisible] = useState(false);
  const [feedHeight, setFeedHeight] = useState(0);
  const [cursor, setCursor] = useState<number | null>(0);
  const feedItemsRef = useRef<FeedItem[]>([]);
  const PAGE_SIZE = 10;
  const MAX_BUFFER = 30;
  const PREFETCH_THRESHOLD = 3;

  useEffect(() => {
    feedItemsRef.current = feedItems;
  }, [feedItems]);

  const appendItems = useCallback(
    (newItems: FeedItem[], reset = false) => {
      const base = reset ? [] : feedItemsRef.current;
      const map = new Map<string, FeedItem>();
      base.forEach((item) => map.set(item.id, item));
      newItems.forEach((item) => map.set(item.id, item));
      const merged = Array.from(map.values());
      const trimmed =
        merged.length > MAX_BUFFER
          ? merged.slice(merged.length - MAX_BUFFER)
          : merged;
      feedItemsRef.current = trimmed;
      setFeedItems(trimmed);
    },
    []
  );

  const loadLovedFeed = useCallback(
    async (reset = false) => {
      const targetCursor = reset ? 0 : cursor;
      if (targetCursor === null && !reset) {
        return;
      }

      const shouldShowLoader = reset || feedItemsRef.current.length === 0;
      if (shouldShowLoader) {
        setLoading(true);
      }

      setError(null);

      try {
        const { items, nextPage } = await fetchLovedFeedPage(
          targetCursor ?? 0,
          PAGE_SIZE
        );
        appendItems(items, reset);
        setCursor(nextPage);
      } catch (err: any) {
        console.error("Error loading loved feed:", err);
        setError(err?.message || "Failed to load liked videos.");
      } finally {
        if (shouldShowLoader) {
          setLoading(false);
        }
      }
    },
    [appendItems, cursor]
  );

  useEffect(() => {
    loadLovedFeed(true);
  }, [loadLovedFeed]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      setCursor(0);
      await loadLovedFeed(true);
    } finally {
      setRefreshing(false);
    }
  }, [loadLovedFeed]);

  const initialScrollIndex = useMemo(() => {
    if (!initialFeedItemId || feedItems.length === 0) return 0;
    const index = feedItems.findIndex((item) => item.id === initialFeedItemId);
    return index >= 0 ? index : 0;
  }, [initialFeedItemId, feedItems]);

  // Update current feed item when list scrolls
  const handleCurrentItemChange = useCallback((item: FeedItem) => {
    setCurrentFeedItem(item);
  }, []);

  const handleLayout = useCallback((event: any) => {
    const { height } = event.nativeEvent.layout;
    setFeedHeight(height);
  }, []);

  const handleIndexChange = useCallback(
    (index: number) => {
      const remaining = feedItemsRef.current.length - index - 1;
      if (remaining <= PREFETCH_THRESHOLD) {
        loadLovedFeed();
      }
    },
    [loadLovedFeed]
  );

  const handleSendComment = useCallback(async (text: string) => {
    if (!currentFeedItem) return;
    try {
      await commentService.addComment(currentFeedItem.id, text);
    } catch (error) {
      console.error("Error sending comment:", error);
    }
  }, [currentFeedItem]);

  const handleSendGifComment = useCallback(
    async (gifUrl: string) => {
      if (!currentFeedItem) return;
      try {
        await commentService.addComment(currentFeedItem.id, gifUrl, undefined, "GIF");
      } catch (error) {
        console.error("Error sending comment gif:", error);
      }
    },
    [currentFeedItem]
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <FeedHeader placeholder="Search liked videos" />

      <View style={{ flex: 1 }} onLayout={handleLayout}>
        {feedHeight > 0 && (
          <VerticalFeedList
            data={feedItems}
            loading={loading}
            error={error}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            onRetry={() => loadLovedFeed(true)}
            initialScrollIndex={initialScrollIndex}
            emptyMessage="No liked videos yet."
            onCurrentItemChange={handleCurrentItemChange}
            onCurrentIndexChange={handleIndexChange}
            hasBottomCommentBar={true}
            viewHeight={feedHeight}
          />
        )}
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <QuickCommentBar
          onSendComment={handleSendComment}
          onSendGif={handleSendGifComment}
          placeholder="Thêm bình luận..."
          // @ts-ignore
          avatarUrl={user?.imageUrl}
        />
      </KeyboardAvoidingView>
    </View>
  );
};

export default LikedFeedScreen;
