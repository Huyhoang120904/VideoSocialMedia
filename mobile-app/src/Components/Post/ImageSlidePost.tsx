import React, { useState, useRef } from "react";
import {
    View,
    Image,
    Dimensions,
    FlatList,
    StyleSheet,
    TouchableOpacity,
    Text,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import RightVideo from "./RightVideo";
import BottomVideo from "./BottomVideo";
import { ImageSlideData } from "../../Store/feedSlice";

const { height: screenHeight, width: screenWidth } = Dimensions.get("window");

interface ImageSlidePostProps {
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
}

export default function ImageSlidePost({
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
}: ImageSlidePostProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const flatListRef = useRef<FlatList>(null);
    const insets = useSafeAreaInsets();
    const tabBarHeight = useBottomTabBarHeight();
    const imageHeight = itemHeight || screenHeight + insets.top;

    // Calculate dynamic bottom position (same logic as VideoCard)
    const bottomContentBottom = tabBarHeight + 4 + 30 + 8;

    const renderImage = ({ item, index }: { item: any; index: number }) => {
        const imageUrl = item.secureUrl || item.url;
        console.log(`ImageSlidePost: Rendering image ${index + 1}/${imageSlide.images.length}`, {
            id: item.id,
            url: imageUrl,
            hasSecureUrl: !!item.secureUrl,
            hasUrl: !!item.url
        });

        return (
            <Image
                source={{ uri: imageUrl }}
                style={[styles.image, { width: screenWidth, height: imageHeight }]}
                resizeMode="contain"
            />
        );
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const index = Math.round(contentOffsetX / screenWidth);
        setCurrentImageIndex(index);
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

                {/* Image counter */}
                <View style={styles.counterContainer}>
                    <View style={styles.counterBadge}>
                        <Text style={styles.counterText}>
                            {currentImageIndex + 1}/{imageSlide.images.length}
                        </Text>
                    </View>
                </View>
            </View>

            <RightVideo
                id={imageSlide.id}
                feedItemType="IMAGE_SLIDE"
                likes={likes}
                comments={comments}
                shares={shares}
                outstanding={outstanding}
                bottomPosition={bottomContentBottom}
            />

            <BottomVideo
                title={title}
                description={description}
                bottomPosition={bottomContentBottom}
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
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    activeDot: {
        backgroundColor: "#fff",
        width: 20,
    },
    inactiveDot: {
        backgroundColor: "rgba(255, 255, 255, 0.5)",
    },
    counterContainer: {
        position: "absolute",
        top: 50,
        right: 16,
    },
    counterBadge: {
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    counterText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "600",
    },
});
