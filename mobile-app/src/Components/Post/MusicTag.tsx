/**
 * MusicTag Component
 * Displays music/sound information with icon
 */

import React from 'react';
import { View, Text, StyleSheet, DimensionValue } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';

interface MusicTagProps {
    musicName?: string;
    artistName?: string;
    maxWidth?: DimensionValue;
}

const MusicTag: React.FC<MusicTagProps> = ({
    musicName,
    artistName,
    maxWidth = '80%',
}) => {
    const displayText = musicName || `Original sound - ${artistName || 'Unknown'}`;

    return (
        <View style={[styles.container, { maxWidth }]}>
            <Ionicons
                name="musical-notes"
                size={theme.typography.fontSize.medium}
                color={theme.colors.text.primary}
            />
            <Text
                style={styles.text}
                numberOfLines={1}
                ellipsizeMode="tail"
            >
                {displayText}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background.overlay,
        paddingHorizontal: theme.layout.spacing.small,
        paddingVertical: theme.layout.spacing.tiny,
        borderRadius: theme.layout.borderRadius.medium,
        alignSelf: 'flex-start',
    },
    text: {
        color: theme.colors.text.primary,
        fontSize: theme.typography.fontSize.small,
        fontFamily: theme.typography.fontFamily.regular,
        marginLeft: theme.layout.spacing.tiny,
        opacity: theme.opacity.mostlyVisible,
        flex: 1,
    },
});

export default MusicTag;
