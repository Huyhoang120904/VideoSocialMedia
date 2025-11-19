/**
 * UserInfoSection Component
 * Bottom section with user info, caption, and music tag
 * Replaces BottomVideo.tsx with better structure
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Animated } from 'react-native';
import { theme } from '../../constants/theme';
import { getBottomPosition } from '../../Utils/responsive';
import MusicTag from './MusicTag';

interface UserInfoSectionProps {
    username?: string;
    title?: string;
    description?: string;
    musicName?: string;
    onUsernamePress?: () => void;
}

const UserInfoSection: React.FC<UserInfoSectionProps> = ({
    username = 'user1',
    title,
    description,
    musicName,
    onUsernamePress,
}) => {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const scrollAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // Auto-scrolling for long text
    useEffect(() => {
        if (description && description.length > 80 && !showFullDescription) {
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: theme.animationTimings.duration.normal,
                useNativeDriver: true,
            }).start();

            // Scroll animation
            const animation = Animated.loop(
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
            );
            animation.start();

            return () => animation.stop();
        }
    }, [description, showFullDescription, scrollAnim, fadeAnim]);

    const toggleDescription = () => {
        setShowFullDescription(!showFullDescription);
    };

    const displayDescription = description && description.length > 150 && !showFullDescription
        ? description.substring(0, 150) + '...'
        : description;

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                {/* Username */}
                <Pressable onPress={onUsernamePress}>
                    <Text style={styles.username}>@{username}</Text>
                </Pressable>

                {/* Title/Caption */}
                {title && (
                    <Pressable onPress={toggleDescription}>
                        <Text
                            style={styles.title}
                            numberOfLines={showFullDescription ? undefined : 2}
                        >
                            {title}
                        </Text>
                    </Pressable>
                )}

                {/* Description */}
                {description && (
                    <Pressable onPress={toggleDescription}>
                        <Animated.View
                            style={{
                                transform: [{ translateX: showFullDescription ? 0 : scrollAnim }],
                                opacity: fadeAnim,
                            }}
                        >
                            <Text
                                style={styles.description}
                                numberOfLines={showFullDescription ? undefined : 2}
                            >
                                {displayDescription}
                            </Text>
                        </Animated.View>
                    </Pressable>
                )}

                {/* Music Tag */}
                <MusicTag
                    musicName={musicName}
                    artistName={username}
                    maxWidth="85%"
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: theme.layout.spacing.large,
        right: theme.layout.spacing.large,
        bottom: getBottomPosition(),
        flexDirection: 'row',
        alignItems: 'flex-end',
        zIndex: theme.layout.zIndex.content,
    },
    contentContainer: {
        flex: 1,
        marginRight: theme.layout.spacing.large * 3, // Leave space for InteractionBar
    },
    username: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.large,
        fontFamily: theme.typography.fontFamily.bold,
        fontWeight: theme.typography.fontWeight.bold,
        marginBottom: theme.layout.spacing.tiny,
    },
    title: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.medium,
        fontFamily: theme.typography.fontFamily.regular,
        marginBottom: theme.layout.spacing.tiny,
        lineHeight: theme.typography.fontSize.medium * theme.typography.lineHeight.normal,
        flexWrap: 'wrap',
    },
    description: {
        color: theme.colors.text.secondary,
        fontSize: theme.typography.fontSize.small,
        fontFamily: theme.typography.fontFamily.regular,
        lineHeight: theme.typography.fontSize.small * theme.typography.lineHeight.normal,
        marginBottom: theme.layout.spacing.small,
        opacity: theme.opacity.mostlyVisible,
    },
});

export default UserInfoSection;
