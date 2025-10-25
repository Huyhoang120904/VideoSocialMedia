import React, { useEffect, useRef } from "react";
import { View, Text, Animated, Pressable } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import styles from "./styles";

interface BottomVideoProps {
    title: string;
    description?: string;
    username?: string;
}

export default function BottomVideo({ title, description, username = "user1" }: BottomVideoProps) {
    const scrollAnim = useRef(new Animated.Value(0)).current;
    const [showFullDescription, setShowFullDescription] = React.useState(false);

    // Animated scrolling text for long descriptions
    useEffect(() => {
        if (description && description.length > 50 && !showFullDescription) {
            Animated.loop(
                Animated.sequence([
                    Animated.delay(2000),
                    Animated.timing(scrollAnim, {
                        toValue: -100,
                        duration: 3000,
                        useNativeDriver: true,
                    }),
                    Animated.delay(1000),
                    Animated.timing(scrollAnim, {
                        toValue: 0,
                        duration: 1000,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        }
    }, [description, showFullDescription]);

    const displayDescription = description && description.length > 100 && !showFullDescription
        ? description.substring(0, 100) + "..."
        : description;

    return (
        <View style={styles.bottomVideoContainer}>
            <View style={styles.contentLeft}>
                {/* Username with @ symbol */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                    <Text style={styles.username}>@{username}</Text>
                </View>

                {/* Title/Caption */}
                <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
                    <Text style={styles.title} numberOfLines={showFullDescription ? undefined : 2}>
                        {title || "No title"}
                    </Text>
                </Pressable>

                {/* Description with animated scroll */}
                {description && (
                    <Pressable onPress={() => setShowFullDescription(!showFullDescription)}>
                        <Animated.View style={{ transform: [{ translateX: showFullDescription ? 0 : scrollAnim }] }}>
                            <Text 
                                style={styles.description} 
                                numberOfLines={showFullDescription ? undefined : 2}
                            >
                                {displayDescription}
                            </Text>
                        </Animated.View>
                    </Pressable>
                )}

                {/* Music/Sound info */}
                <View style={styles.musicContainer}>
                    <Ionicons name="musical-notes" size={14} color="#fff" />
                    <Text style={styles.musicText} numberOfLines={1}>
                        Original sound - {username}
                    </Text>
                </View>
            </View>
        </View>
    );
}