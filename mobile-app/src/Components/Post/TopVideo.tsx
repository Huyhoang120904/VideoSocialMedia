import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Animated, Pressable, PanResponder } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import styles from "./styles";
import { useNavigation } from '@react-navigation/native';


const tabs = ["Khám phá", "Bạn bè", "Đã follow", "Đề xuất"] as const;

interface TopVideoProps {
    activeTab: typeof tabs[number];
    setActiveTab: (tab: typeof tabs[number]) => void;
    onReloadCurrentTab?: () => void; // Callback khi click vào tab đang active
    imageSlideInfo?: { currentIndex: number; totalImages: number } | null; // Thông tin image slide hiện tại
}


export default function TopVideo({ activeTab, setActiveTab, onReloadCurrentTab, imageSlideInfo }: TopVideoProps) {
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineWidth, setUnderlineWidth] = useState(20);
    const translateX = useRef(new Animated.Value(0)).current;

    const containerRef = useRef<View>(null);
    const tabRefs = useRef<Array<View | null>>([]);
    const navigation = useNavigation();

    const moveUnderline = (index: number) => {
        const tab = tabRefs.current[index];
        const container = containerRef.current;
        if (!tab || !container) return;

        // đo tab **relative container**
        tab.measureLayout(container, (x, y, width) => {
            const newWidth = Math.max(width, 20);
            const centerX = x + width / 2 - newWidth / 2;

            Animated.spring(translateX, {
                toValue: centerX,
                useNativeDriver: true,
                tension: 110,
                friction: 7,
            }).start();

            setUnderlineWidth(newWidth);
        }, () => { });
    };
    const handlePress = (index: number) => {
        const selectedTab = tabs[index];

        // Kiểm tra nếu click vào tab đang active
        if (selectedTab === activeTab) {
            console.log('🔄 Reloading current tab:', selectedTab);
            // Gọi callback để reload
            if (onReloadCurrentTab) {
                onReloadCurrentTab();
            }
        } else {
            // Chuyển sang tab khác
            console.log('➡️ Switching to tab:', selectedTab);
            setActiveTab(selectedTab);
            moveUnderline(index);
        }
    };
    useEffect(() => {
        // Cập nhật underline khi activeTab thay đổi
        const index = tabs.indexOf(activeTab);
        moveUnderline(index);
    }, [activeTab]);

    // PanResponder để xử lý swipe trái/phải cho top tabs
    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            // Chỉ kích hoạt khi swipe ngang
            return Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 15;
        },
        onPanResponderRelease: (evt, gestureState) => {
            const currentIndex = tabs.indexOf(activeTab);
            const swipeThreshold = 30;

            console.log('TopVideo gesture dx:', gestureState.dx, 'Current tab:', activeTab);

            if (gestureState.dx > swipeThreshold) {
                // Swipe right - chuyển sang tab trước đó
                if (currentIndex > 0) {
                    console.log('Switching to previous tab:', tabs[currentIndex - 1]);
                    handlePress(currentIndex - 1);
                }
            } else if (gestureState.dx < -swipeThreshold) {
                // Swipe left - chuyển sang tab tiếp theo
                if (currentIndex < tabs.length - 1) {
                    console.log('Switching to next tab:', tabs[currentIndex + 1]);
                    handlePress(currentIndex + 1);
                }
            }
        },
    });

    return (
        <View style={styles.topVideoContainer}>
            {/* Gradient overlay for better readability */}
            <LinearGradient
                colors={['rgba(0,0,0,0.5)', 'rgba(0,0,0,0.2)', 'transparent']}
                style={styles.topGradient}
            />

            {/* Live icon - Left side */}
            <Pressable 
                style={styles.liveButton}
                onPress={() => {
                    console.log('Navigate to Live streams');
                    // navigation.navigate('Live');
                }}
            >
                <Ionicons name="tv-outline" size={24} color="#fff" />
            </Pressable>

            {/* Tabs container */}
            <View style={styles.tabsWrapper} {...panResponder.panHandlers}>
                <View ref={containerRef} style={styles.tabsContainer}>
                    {tabs.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={() => handlePress(index)}
                            style={styles.tabButton}
                        >
                            <View ref={el => { tabRefs.current[index] = el }}>
                                <Text
                                    style={[
                                        styles.titleTop,
                                        activeTab === item && styles.titleTopActive,
                                    ]}
                                >
                                    {item}
                                </Text>
                            </View>
                        </Pressable>
                    ))}

                    {/* Underline with smooth animation */}
                    <Animated.View
                        style={[
                            styles.underline,
                            {
                                width: underlineWidth,
                                transform: [{ translateX }],
                            }
                        ]}
                    />
                </View>
            </View>

            {/* Search icon - Right side */}
            <View style={styles.searchButtonContainer}>
                <Pressable 
                    style={styles.searchButton}
                    onPress={() => {
                        console.log('Navigate to Search');
                        navigation.navigate('Search' as never);
                    }}
                >
                    <Ionicons name="search-outline" size={24} color="#fff" />
                </Pressable>
                {/* Image slide counter - hiển thị dưới nút search */}
                {imageSlideInfo && imageSlideInfo.totalImages > 0 && (
                    <View style={styles.imageCounter}>
                        <Text style={styles.imageCounterText}>
                            {imageSlideInfo.currentIndex + 1}/{imageSlideInfo.totalImages}
                        </Text>
                    </View>
                )}
            </View>
        </View>
    );
}
