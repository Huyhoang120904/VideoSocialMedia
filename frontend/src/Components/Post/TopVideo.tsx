import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Animated, Pressable } from 'react-native';
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

    return (
        <View style={styles.topVideoContainer}>
            {/* Container con để căn giữa */}
            <View ref={containerRef} style={{ flexDirection: 'row', alignSelf: 'center' }}>
                {tabs.map((item, index) => (
                    <Pressable
                        key={index}
                        onPress={() => handlePress(index)}
                        style={{ paddingHorizontal: 8, paddingVertical: 6 }}
                    >
                        <View ref={el => { tabRefs.current[index] = el }}>
                            <Text
                                style={[
                                    styles.titleTop,
                                    activeTab === item && { fontWeight: "800", color: "#fff" },
                                ]}
                            >
                                {item}
                            </Text>
                        </View>
                    </Pressable>
                ))}

                {/* Underline */}
                <Animated.View
                    style={{
                        position: "absolute",
                        bottom: 0,
                        width: underlineWidth,
                        height: 3,
                        backgroundColor: "#fff",
                        borderRadius: 3,
                        transform: [{ translateX }],
                    }}
                />
            </View>
        </View>
    );
}
