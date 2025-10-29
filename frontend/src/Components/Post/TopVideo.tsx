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
}


export default function TopVideo({ activeTab, setActiveTab }: TopVideoProps) {
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
                tension: 100,
                friction: 8,
            }).start();

            setUnderlineWidth(newWidth);
        }, () => { });
    };
    const handlePress = (index: number) => {
        setActiveTab(tabs[index]); // thay đổi tab
        moveUnderline(index);
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
                colors={['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)', 'transparent']}
                style={styles.topGradient}
            />
            
            {/* Search icon */}
            {/* <Pressable style={styles.searchIcon}>
                <Ionicons name="search" size={24} color="#fff" />
            </Pressable> */}

            {/* Tabs container */}
            <View style={styles.tabsWrapper} {...panResponder.panHandlers}>
                <View ref={containerRef} style={{ flexDirection: 'row', alignSelf: 'center' }}>
                    {tabs.map((item, index) => (
                        <Pressable
                            key={index}
                            onPress={() => handlePress(index)}
                            style={{ paddingHorizontal: 12, paddingVertical: 8 }}
                        >
                            <View ref={el => { tabRefs.current[index] = el }}>
                                <Text
                                    style={[
                                        styles.titleTop,
                                        activeTab === item && { 
                                            fontWeight: "800", 
                                            color: "#fff",
                                            fontSize: 12, // Giảm từ 14 xuống 12 để nhỏ hơn
                                        },
                                    ]}
                                >
                                    {item}
                                </Text>
                            </View>
                        </Pressable>
                    ))}

                    {/* Underline with shadow */}
                    <Animated.View
                        style={{
                            position: "absolute",
                            bottom: 0,
                            width: underlineWidth,
                            height: 4,
                            backgroundColor: "#fff",
                            borderRadius: 2,
                            transform: [{ translateX }],
                            shadowColor: "#fff",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 0.8,
                            shadowRadius: 4,
                            elevation: 5,
                        }}
                    />
                </View>
            </View>
        </View>
    );
}
