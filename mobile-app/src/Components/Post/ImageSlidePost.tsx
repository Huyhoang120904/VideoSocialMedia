import React, { useState, useRef, useEffect } from "react";
import {
    View,
    Image,
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Text,
    Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import RightVideo from "./RightVideo";
import BottomVideo from "./BottomVideo";
import VideoCommentModal from "../Comment/VideoCommentModal";
import VideoOptionsModal from "./VideoOptionsModal";
import { ImageSlideData } from "../../Store/feedSlice";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface ImageSlidePostProps {
    feedItemId: string; // ✅ FeedItem ID - dùng cho API love
    imageSlide: ImageSlideData;
    likes: number;
    comments: number;
    shares: number;
    outstanding?: number;
    title?: string;
    description?: string;
    isActive: boolean;
    itemHeight?: number;
    hashtags?: string[];
    loved?: boolean; // Trạng thái đã yêu thích
    username?: string; // Username của người upload
    avatarUrl?: string; // Avatar URL của người upload
    uploaderUserId?: string; // UserDetail ID của người upload
    onImageSlideChange?: (currentIndex: number, totalImages: number) => void; // Callback để truyền thông tin lên
}

export default function ImageSlidePost({
    feedItemId,
    imageSlide,
    likes,
    comments,
    shares,
    outstanding = 0,
    title = "",
    description = "",
    isActive,
    itemHeight = screenHeight,
    hashtags,
    loved = false,
    username = "user1",
    avatarUrl,
    uploaderUserId,
    onImageSlideChange,
}: ImageSlidePostProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [commentModalVisible, setCommentModalVisible] = useState(false);
    const [optionsModalVisible, setOptionsModalVisible] = useState(false);
    const [currentComments, setCurrentComments] = useState(comments);
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    // Don't add insets.top to image height — adding the top safe-area was
    // increasing the overall item height (~35px) and pushing BottomVideo/RightVideo up.
    const imageHeight = itemHeight || screenHeight;

    // Sync comments count with prop
    useEffect(() => {
        setCurrentComments(comments);
    }, [comments]);

    // Calculate dynamic bottom position (same logic as VideoCard)
    // Keep a small extra spacing above the tab bar
    const bottomContentBottom = tabBarHeight + 12;

    const renderImage = ({ item, index }: { item: any; index: number }) => {
        const imageUrl = item.secureUrl || item.url;

        return (
            <Pressable
                onLongPress={() => {
                    setOptionsModalVisible(true);
                }}
                delayLongPress={500}
            >
                <Image
                    source={{ uri: imageUrl }}
                    style={[styles.image, { width: screenWidth, height: imageHeight }]}
                    resizeMode="contain"
                />
            </Pressable>
        );
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / screenWidth);
        setCurrentImageIndex(index);
        // Gọi callback để truyền thông tin lên
        if (onImageSlideChange && isActive) {
            onImageSlideChange(index, imageSlide.images.length);
        }
    };

    // Cập nhật khi isActive thay đổi
    useEffect(() => {
        if (isActive && onImageSlideChange) {
            onImageSlideChange(currentImageIndex, imageSlide.images.length);
        } else if (!isActive && onImageSlideChange) {
            // Reset khi không active
            onImageSlideChange(-1, 0);
        }
    }, [isActive, currentImageIndex, imageSlide.images.length, onImageSlideChange]);

    // Comment modal handlers
    const handleOpenComments = () => {
        setCommentModalVisible(true);
    };

    const handleCloseComments = () => {
        setCommentModalVisible(false);
    };

    const handleAddComment = (comment: string) => {
        console.log('New comment:', comment);
    };

    const handleUpdateCommentCount = (newCount: number) => {
        setCurrentComments(newCount);
    };

    return (
        <View style={[styles.container, { height: itemHeight }]}>
            <View style={[styles.imageContainer, { height: imageHeight }]}>
                <FlatList
                    ref={flatListRef}
                    data={imageSlide.images}
                    renderItem={renderImage}
                    keyExtractor={(item, index) => `${item.id}-${index}`}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    onScroll={handleScroll}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    snapToAlignment="center"
                    snapToInterval={screenWidth}
                />

                {/* Image indicator dots */}
                {imageSlide.images.length > 1 && (
                    <View style={styles.dotsContainer}>
                        {imageSlide.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    currentImageIndex === index ? styles.activeDot : styles.inactiveDot,
                                ]}
                            />
                        ))}
                    </View>
                )}

            </View>

            <RightVideo
                id={feedItemId}
                likes={likes}
                comments={currentComments}
                shares={shares}
                outstanding={outstanding}
                isLoved={loved}
                avatarUrl={avatarUrl}
                uploaderUserId={uploaderUserId}
                username={username}
                onCommentPress={handleOpenComments}
            />

            <BottomVideo
                title={title}
                description={description}
                hashtags={hashtags}
                username={username}
            />

            {/* Comment Modal */}
            <VideoCommentModal
                visible={commentModalVisible}
                onClose={handleCloseComments}
                videoId={feedItemId}
                feedItemType="IMAGE_SLIDE"
                onAddComment={handleAddComment}
                onUpdateCommentCount={handleUpdateCommentCount}
            />

            {/* Video Options Modal */}
            <VideoOptionsModal
                visible={optionsModalVisible}
                onClose={() => setOptionsModalVisible(false)}
                onDownload={() => {
                    console.log('Download image');
                }}
                onNotInterested={() => {
                    console.log('Not interested');
                }}
                onReport={() => {
                    console.log('Report image');
                }}
                onSpeedChange={(speed) => {
                    console.log('Speed change not applicable for images');
                }}
                onSimplifiedScreen={() => {
                    console.log('Simplified screen');
                }}
                onSubtitles={() => {
                    console.log('Subtitles not applicable for images');
                }}
                onPictureInPicture={() => {
                    console.log('Picture in picture not applicable for images');
                }}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    imageContainer: {
        position: "relative",
    },
    image: {
        backgroundColor: "#000",
    },
    dotsContainer: {
        position: "absolute",
        bottom: 100,
        left: 0,
        right: 0,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 6,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
    },
    activeDot: {
        backgroundColor: "#fff",
        width: 24,
        shadowColor: "#fff",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 4,
        elevation: 3,
    },
    inactiveDot: {
        backgroundColor: "#ccc",
    },
});
