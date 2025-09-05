// Home.tsx - TikTok-like scrolling behavior
import React, { useRef, useState, useCallback, useEffect } from "react";
import { FlatList, Dimensions, ViewToken } from "react-native";
import { useDispatch, useSelector } from 'react-redux';
import { setVideos } from '../../store/videoSlice';
import Post from "../../Components/Post";
import type { RootState } from '../../store/index';
import type { Video } from '../../store/videoSlice';
import videoData from "./apiVideo";

const { height } = Dimensions.get("screen");

interface ViewableItemsChanged {
    viewableItems: ViewToken[];
    changed: ViewToken[];
}

export default function Home() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const flatListRef = useRef<FlatList<Video>>(null);
    const videos = useSelector((state: RootState) => state.videos.videos);
    const dispatch = useDispatch();
    const isChangingIndex = useRef(false);

    useEffect(() => {
        if (videos.length === 0) {
            dispatch(setVideos(videoData));
        }
    }, [dispatch]);

    const onViewableItemsChanged = useCallback(({ viewableItems }: ViewableItemsChanged) => {
        if (isChangingIndex.current) return;

        if (viewableItems.length > 0) {
            const visibleItem = viewableItems.find(item =>
                item.isViewable &&
                item.index !== null &&
                item.index !== undefined
            );

            if (visibleItem && visibleItem.index != null && visibleItem.index !== currentIndex) {
                isChangingIndex.current = true;
                setCurrentIndex(visibleItem.index);

                setTimeout(() => {
                    isChangingIndex.current = false;
                }, 100);
            }

        }
    }, [currentIndex]);
    const viewabilityConfig = {
        viewAreaCoveragePercentThreshold: 100,
        waitForInteraction: false,
        minimumViewTime: 50,
    };

    const getItemLayout = useCallback((_: any, index: number) => ({
        length: height,
        offset: height * index,
        index,
    }), []);

    const renderItem = useCallback(({ item, index }: { item: Video; index: number }) => (
        <Post
            video={item}
            isActive={index === currentIndex}
            itemHeight={height}
        />
    ), [currentIndex]);

    const keyExtractor = useCallback((item: Video) => item.id, []);

    return (
        <FlatList<Video>
            ref={flatListRef}
            data={videos}
            renderItem={renderItem}
            keyExtractor={keyExtractor}

            // Perfect paging like TikTok
            showsVerticalScrollIndicator={false}
            pagingEnabled={true}
            snapToInterval={height}
            snapToAlignment="start"
            decelerationRate="fast"
            bounces={false}
            scrollEventThrottle={1} // More responsive

            // Minimal rendering for smooth scrolling
            initialNumToRender={1}
            maxToRenderPerBatch={1}
            windowSize={1} // Only render current + 1 above/below
            removeClippedSubviews={true}

            // Layout
            getItemLayout={getItemLayout}
            onViewableItemsChanged={onViewableItemsChanged}
            viewabilityConfig={viewabilityConfig}

            // Prevent any layout shifts
            contentContainerStyle={{ flexGrow: 1 }}
            style={{ flex: 1 }}

            // Disable momentum for precise control
            disableIntervalMomentum={true}

            // Error handling
            onScrollToIndexFailed={() => { }} // Ignore scroll failures
        />
    );
}