import React, { useState, useRef, useEffect } from 'react';
import { Text, View, Animated, Pressable } from 'react-native';
import styles from "./styles";

export default function TopVideo() {
    const tabs = ["Khám phá", "Bạn bè", "Đã follow", "Đề xuất"];
    const [activeIndex, setActiveIndex] = useState(0);
    const [underlineWidth, setUnderlineWidth] = useState(20);
    const translateX = useRef(new Animated.Value(0)).current;

    const containerRef = useRef<View>(null);
    const tabRefs = useRef<Array<View | null>>([]);

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
        setActiveIndex(index);
        moveUnderline(index);
    };

    useEffect(() => {
        setTimeout(() => moveUnderline(0), 0);
    }, []);

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
                                    activeIndex === index && { fontWeight: "800", color: "#fff" },
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
