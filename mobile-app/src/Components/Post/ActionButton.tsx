/**
 * ActionButton Component
 * Reusable button for interaction bar (like, comment, share, bookmark)
 */

import React, { useRef } from 'react';
import { Pressable, Text, Animated, ViewStyle, TextStyle, PressableStateCallbackType } from 'react-native';
import { theme } from '../../constants/theme';

interface ActionButtonProps {
    icon: React.ReactNode;
    count?: number;
    onPress?: () => void;
    isActive?: boolean;
    activeColor?: string;
    containerStyle?: ViewStyle;
    testID?: string;
    accessibilityLabel?: string;
    showCount?: boolean;
}

const ActionButton: React.FC<ActionButtonProps> = ({
    icon,
    count = 0,
    onPress,
    isActive = false,
    activeColor = theme.colors.primary,
    containerStyle,
    testID,
    accessibilityLabel,
    showCount = true,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.85,
            useNativeDriver: true,
            ...theme.animationTimings.spring.standard,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            ...theme.animationTimings.spring.bouncy,
        }).start();
    };

    const formatCount = (num: number): string => {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    };

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            testID={testID}
            accessibilityLabel={accessibilityLabel}
            accessibilityRole="button"
            style={[styles.container, containerStyle]}
        >
            <Animated.View style={[styles.iconContainer, { transform: [{ scale: scaleAnim }] }]}>
                {icon}
            </Animated.View>
            {showCount && (
                <Text style={[styles.countText, isActive && { color: activeColor }]}>
                    {formatCount(count)}
                </Text>
            )}
        </Pressable>
    );
};

const styles = {
    container: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
        marginBottom: theme.layout.spacing.medium,
        minWidth: theme.layout.dimensions.iconContainer,
    },
    iconContainer: {
        alignItems: 'center' as const,
        justifyContent: 'center' as const,
    },
    countText: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.small,
        fontFamily: theme.typography.fontFamily.semiBold,
        marginTop: theme.layout.spacing.tiny,
        fontWeight: theme.typography.fontWeight.semiBold,
        textAlign: 'center' as const,
        minWidth: 20,
    },
};

export default ActionButton;
