/**
 * InteractionBar Component
 * Right sidebar with all interaction buttons (like, comment, share, bookmark)
 * Replaces RightVideo.tsx with better structure
 */

import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet, Animated, Image } from 'react-native';
import { useDispatch } from 'react-redux';
import { updateVideo } from '../../Store/videoSlice';
import { AntDesign, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { theme } from '../../constants/theme';
import { getBottomPosition } from '../../Utils/responsive';
import ActionButton from './ActionButton';
import UserAvatar from './UserAvatar';
import VideoCommentModal from '../Comment/VideoCommentModal';

interface InteractionBarProps {
    id: string;
    likes: number;
    comments: number;
    shares: number;
    outstanding: number;
    feedItemType: 'VIDEO' | 'IMAGE_SLIDE';
    avatarUrl?: string;
    onFollowPress?: () => void;
    isFollowing?: boolean;
}

const InteractionBar: React.FC<InteractionBarProps> = ({
    id,
    likes,
    comments,
    shares,
    outstanding,
    feedItemType,
    avatarUrl,
    onFollowPress,
    isFollowing = false,
}) => {
    const dispatch = useDispatch();
    const [liked, setLiked] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [localLikes, setLocalLikes] = useState(likes);
    const [localComments, setLocalComments] = useState(comments);
    const [commentModalVisible, setCommentModalVisible] = useState(false);

    // Animations
    const likeScale = useRef(new Animated.Value(1)).current;
    const musicRotation = useRef(new Animated.Value(0)).current;

    // Rotating music disc animation
    useEffect(() => {
        const animation = Animated.loop(
            Animated.timing(musicRotation, {
                toValue: 1,
                duration: 3000,
                useNativeDriver: true,
            })
        );
        animation.start();

        return () => animation.stop();
    }, [musicRotation]);

    const spin = musicRotation.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    const handleLike = () => {
        // Animate like button
        Animated.sequence([
            Animated.timing(likeScale, {
                toValue: 1.4,
                duration: theme.animationTimings.duration.fast,
                useNativeDriver: true,
            }),
            Animated.spring(likeScale, {
                toValue: 1,
                useNativeDriver: true,
                ...theme.animationTimings.spring.bouncy,
            }),
        ]).start();

        const newLiked = !liked;
        setLiked(newLiked);
        const newLikes = newLiked ? localLikes + 1 : localLikes - 1;
        setLocalLikes(newLikes);
        dispatch(updateVideo({ id, updates: { likes: newLikes } }));
    };

    const handleBookmark = () => {
        setBookmarked(!bookmarked);
        // Add bookmark logic here
    };

    const handleOpenComments = () => {
        setCommentModalVisible(true);
    };

    const handleCloseComments = () => {
        setCommentModalVisible(false);
    };

    const handleCommentAdded = (comment: string) => {
        // Callback này chỉ để compatibility, số lượng thực tế sẽ update từ handleUpdateCommentCount
        console.log('[InteractionBar] Comment added:', comment);
    };

    const handleUpdateCommentCount = (newCount: number) => {
        console.log('[InteractionBar] Updating comment count to:', newCount);
        setLocalComments(newCount);
        dispatch(updateVideo({ id, updates: { comments: newCount } }));
    };

    const handleShare = () => {
        // Add share logic here
        console.log('Share video:', id);
    };

    return (
        <View style={styles.container}>
            {/* User Avatar with Follow Button */}
            <UserAvatar
                avatarUrl={avatarUrl}
                showFollowButton={!isFollowing}
                onFollowPress={onFollowPress}
                isFollowing={isFollowing}
            />

            {/* Like Button with Animation */}
            <ActionButton
                icon={
                    <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                        <AntDesign
                            name="heart"
                            size={theme.componentSizes.icon.large}
                            color={liked ? theme.colors.like : theme.colors.icon.default}
                        />
                    </Animated.View>
                }
                count={localLikes}
                onPress={handleLike}
                isActive={liked}
                activeColor={theme.colors.like}
                containerStyle={styles.likeButton}
                testID="like-button"
                accessibilityLabel={`Like button. ${localLikes} likes`}
            />

            {/* Comment Button */}
            <ActionButton
                icon={
                    <Ionicons
                        name="chatbubble-ellipses"
                        size={theme.componentSizes.icon.large}
                        color={theme.colors.icon.default}
                    />
                }
                count={localComments}
                onPress={handleOpenComments}
                testID="comment-button"
                accessibilityLabel={`Comment button. ${localComments} comments`}
            />

            {/* Bookmark Button */}
            <ActionButton
                icon={
                    <MaterialCommunityIcons
                        name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                        size={theme.componentSizes.icon.large}
                        color={bookmarked ? theme.colors.bookmark : theme.colors.icon.default}
                    />
                }
                count={outstanding}
                onPress={handleBookmark}
                isActive={bookmarked}
                activeColor={theme.colors.bookmark}
                testID="bookmark-button"
                accessibilityLabel={`Bookmark button. ${outstanding} bookmarks`}
            />

            {/* Share Button */}
            <ActionButton
                icon={
                    <MaterialCommunityIcons
                        name="share-variant"
                        size={theme.componentSizes.icon.large}
                        color={theme.colors.icon.default}
                    />
                }
                count={shares}
                onPress={handleShare}
                testID="share-button"
                accessibilityLabel={`Share button. ${shares} shares`}
            />

            {/* Music Icon with Rotation */}
            <View style={styles.musicContainer}>
                <Animated.Image
                    source={require('../../../assets/music-icon.png')}
                    style={[
                        styles.musicIcon,
                        { transform: [{ rotate: spin }] }
                    ]}
                />
            </View>

            {/* Comment Modal */}
            <VideoCommentModal
                visible={commentModalVisible}
                onClose={handleCloseComments}
                videoId={id}
                feedItemType={feedItemType}
                comments={[]}
                onAddComment={handleCommentAdded}
                onUpdateCommentCount={handleUpdateCommentCount}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: theme.layout.spacing.large,
        bottom: getBottomPosition(),
        alignItems: 'center',
        zIndex: theme.layout.zIndex.interaction,
        justifyContent: 'flex-end',
    },
    likeButton: {
        marginTop: theme.layout.spacing.medium,
    },
    musicContainer: {
        marginTop: theme.layout.spacing.small,
        alignItems: 'center',
    },
    musicIcon: {
        width: theme.componentSizes.musicDisc.size,
        height: theme.componentSizes.musicDisc.size,
        borderRadius: theme.componentSizes.musicDisc.size / 2,
        borderWidth: theme.componentSizes.musicDisc.border,
        borderColor: theme.colors.icon.default,
    },
});

export default InteractionBar;
