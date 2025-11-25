import React, { useCallback, useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    View,
    ViewToken,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { FeedItem } from "../../Store/feedSlice";
import FeedPost from "../Post/FeedPost";
import { recordFeedItemView } from "../../Services/FeedService";

interface VerticalFeedListProps {
    data: FeedItem[];
    loading: boolean;
    error: string | null;
    refreshing: boolean;
    onRefresh: () => Promise<void>;
    onRetry: () => void;
    initialScrollIndex?: number;
    emptyMessage?: string;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    onCurrentItemChange?: (item: FeedItem) => void;
    onCurrentIndexChange?: (index: number) => void;
    hasBottomCommentBar?: boolean;
    viewHeight?: number;
}

export default function VerticalFeedList({
    data,
    loading,
    error,
    refreshing,
    onRefresh,
    onRetry,
    initialScrollIndex = 0,
    emptyMessage = "No videos available",
    ListHeaderComponent,
    onCurrentItemChange,
    onCurrentIndexChange,
    hasBottomCommentBar = false,
    viewHeight,
}: VerticalFeedListProps) {
    const { height: windowHeight } = Dimensions.get("window");
    const itemHeight = viewHeight || windowHeight;

    const [currentIndex, setCurrentIndex] = useState(initialScrollIndex);
    const [isScreenActive, setIsScreenActive] = useState(true);
    const flatListRef = useRef<FlatList<FeedItem>>(null);
    const watchedFeedItemsRef = useRef<Set<string>>(new Set());
    const isScrolling = useRef(false);
    const scrollDirection = useRef<"up" | "down" | null>(null);
    const lastScrollY = useRef(0);
    const hasScrolledToInitial = useRef(false);

    // Track screen focus
    useFocusEffect(
        useCallback(() => {
            setIsScreenActive(true);
            return () => setIsScreenActive(false);
        }, [])
    );

    // Scroll to initial index
    useEffect(() => {
        if (
            !hasScrolledToInitial.current &&
            data.length > 0 &&
            initialScrollIndex > 0 &&
            initialScrollIndex < data.length
        ) {
            hasScrolledToInitial.current = true;
            setCurrentIndex(initialScrollIndex);
            setTimeout(() => {
                flatListRef.current?.scrollToIndex({
                    index: initialScrollIndex,
                    animated: false,
                });
            }, 100);
        }
    }, [data, initialScrollIndex]);

    // Record view for active item
    useEffect(() => {
        if (!isScreenActive || data.length === 0) return;

        const activeItem = data[currentIndex];
        if (!activeItem) return;

        // Notify parent about current item/index change
        if (onCurrentItemChange) {
            onCurrentItemChange(activeItem);
        }
        if (onCurrentIndexChange) {
            onCurrentIndexChange(currentIndex);
        }

        if (watchedFeedItemsRef.current.has(activeItem.id)) return;

        watchedFeedItemsRef.current.add(activeItem.id);
        recordFeedItemView(activeItem.id).catch((err) => {
            console.warn("Failed to record view:", err);
            watchedFeedItemsRef.current.delete(activeItem.id);
        });
    }, [currentIndex, isScreenActive, data, onCurrentItemChange, onCurrentIndexChange]);

    // Scroll handling logic (copied from Home.tsx)
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
            flatListRef.current?.scrollToIndex({
                index: currentIndex,
                animated: true,
            });
            isScrolling.current = false;
            return;
        }

        let newIndex = currentIndex;
        if (scrollDirection.current === "down") {
            newIndex = Math.min(currentIndex + 1, data.length - 1);
        } else if (scrollDirection.current === "up") {
            newIndex = Math.max(currentIndex - 1, 0);
        }

        flatListRef.current?.scrollToIndex({
            index: newIndex,
            animated: true,
        });

        setCurrentIndex(newIndex);
        isScrolling.current = false;
        scrollDirection.current = null;
    }, [currentIndex, data.length]);

    const handleMomentumScrollEnd = useCallback((event: any) => {
        isScrolling.current = false;
        const offsetY = event.nativeEvent.contentOffset.y;
        const approximateIndex = Math.round(offsetY / itemHeight);
        const clampedIndex = Math.max(0, Math.min(approximateIndex, data.length - 1));
        if (clampedIndex !== currentIndex) {
            setCurrentIndex(clampedIndex);
        }
        scrollDirection.current = null;
    }, [currentIndex, data.length, itemHeight]);

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
            length: itemHeight,
            offset: itemHeight * index,
            index,
        }),
        [itemHeight]
    );

    const handleScrollToIndexFailed = useCallback((info: { index: number }) => {
        const wait = new Promise((resolve) => setTimeout(resolve, 500));
        wait.then(() => {
            flatListRef.current?.scrollToIndex({
                index: info.index,
                animated: false,
            });
        });
    }, []);

    const renderItem = useCallback(
        ({ item, index }: { item: FeedItem; index: number }) => (
            <FeedPost
                feedItem={item}
                isActive={index === currentIndex && isScreenActive}
                itemHeight={itemHeight}
                hasCommentInputBar={hasBottomCommentBar}
            />
        ),
        [currentIndex, isScreenActive, hasBottomCommentBar, itemHeight]
    );

    const keyExtractor = useCallback((item: FeedItem) => item.id, []);

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#fff" />
                <Text style={styles.loadingText}>Loading videos...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>❌ {error}</Text>
                <Text style={styles.retryText} onPress={onRetry}>
                    Try again
                </Text>
            </View>
        );
    }

    if (data.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.emptyText}>{emptyMessage}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList<FeedItem>
                ref={flatListRef}
                data={data}
                renderItem={renderItem}
                keyExtractor={keyExtractor}
                showsVerticalScrollIndicator={false}
                pagingEnabled
                snapToInterval={itemHeight}
                snapToAlignment="start"
                decelerationRate="fast"
                bounces={true}
                onScrollBeginDrag={handleScrollBeginDrag}
                onScroll={handleScroll}
                onScrollEndDrag={handleScrollEndDrag}
                onMomentumScrollEnd={handleMomentumScrollEnd}
                scrollEventThrottle={16}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                initialNumToRender={2}
                maxToRenderPerBatch={2}
                windowSize={3}
                removeClippedSubviews={true}
                updateCellsBatchingPeriod={50}
                getItemLayout={getItemLayout}
                onScrollToIndexFailed={handleScrollToIndexFailed}
                refreshing={refreshing}
                onRefresh={onRefresh}
                ListHeaderComponent={ListHeaderComponent}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
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
