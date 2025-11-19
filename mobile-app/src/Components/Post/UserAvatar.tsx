/**
 * UserAvatar Component
 * User profile picture with optional follow button
 */

import React from 'react';
import { View, Image, StyleSheet, ImageSourcePropType } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import ActionButton from './ActionButton';

interface UserAvatarProps {
    avatarUrl?: string | ImageSourcePropType;
    size?: number;
    showFollowButton?: boolean;
    onFollowPress?: () => void;
    isFollowing?: boolean;
    borderColor?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({
    avatarUrl,
    size = theme.componentSizes.avatar.medium,
    showFollowButton = true,
    onFollowPress,
    isFollowing = false,
    borderColor = theme.colors.text.primary,
}) => {
    const imageSource = typeof avatarUrl === 'string'
        ? { uri: avatarUrl }
        : avatarUrl || require('../../../assets/avatar.png');

    return (
        <View style={styles.container}>
            <Image
                source={imageSource}
                style={[
                    styles.avatar,
                    {
                        width: size,
                        height: size,
                        borderRadius: size / 2,
                        borderColor: borderColor,
                    }
                ]}
            />
            {showFollowButton && !isFollowing && (
                <ActionButton
                    icon={
                        <MaterialCommunityIcons
                            name="plus-circle"
                            size={theme.componentSizes.plusIcon.size}
                            color={theme.colors.primary}
                        />
                    }
                    onPress={onFollowPress}
                    containerStyle={styles.followButton}
                    showCount={false}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    avatar: {
        borderWidth: theme.componentSizes.avatar.border,
    },
    followButton: {
        position: 'absolute',
        bottom: -8,
        alignSelf: 'center',
        backgroundColor: theme.colors.background.dark,
        borderRadius: theme.componentSizes.plusIcon.containerSize / 2,
        marginBottom: 0,
    },
});

export default UserAvatar;
