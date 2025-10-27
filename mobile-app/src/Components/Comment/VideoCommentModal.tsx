import React, { useState, useRef } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    ScrollView,
    Image,
    Dimensions,
    KeyboardAvoidingView,
    Platform,
    TouchableWithoutFeedback,
    Animated,
    PanResponder,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';

const { height } = Dimensions.get('window');

interface Comment {
    id: string;
    username: string;
    avatar: string;
    comment: string;
    timeAgo: string;
    likes: number;
    isLiked?: boolean;
    replies?: Comment[];
}

interface VideoCommentModalProps {
    visible: boolean;
    onClose: () => void;
    videoId: string;
    comments: Comment[];
    onAddComment: (comment: string) => void;
}

const VideoCommentModal: React.FC<VideoCommentModalProps> = ({
    visible,
    onClose,
    videoId,
    comments,
    onAddComment,
}) => {
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const inputRef = React.useRef<TextInput>(null);
    const translateY = useRef(new Animated.Value(0)).current;

    const headerPanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            // Only respond to downward gestures
            return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
        },
        onPanResponderGrant: () => {
            // Reset any ongoing animations
            translateY.setOffset(translateY._value);
            translateY.setValue(0);
        },
        onPanResponderMove: (evt, gestureState) => {
            if (gestureState.dy > 0) {
                translateY.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (evt, gestureState) => {
            translateY.flattenOffset();
            if (gestureState.dy > 100) {
                // Close modal if dragged down more than 100px
                Animated.timing(translateY, {
                    toValue: height,
                    duration: 300,
                    useNativeDriver: true,
                }).start(() => {
                    onClose();
                    translateY.setValue(0);
                });
            } else {
                // Snap back to original position
                Animated.spring(translateY, {
                    toValue: 0,
                    useNativeDriver: true,
                }).start();
            }
        },
    });

    const emojis = ['😀', '😂', '🥰', '😍', '🤩', '😎', '🔥', '💯', '👏', '❤️',
        '💕', '😭', '😱', '🤔', '👍', '👎', '🙏', '💪', '✨', '🎉'];

    // Sample TikTok-style comments matching the image
    const defaultComments: Comment[] = [
        {
            id: '1',
            username: 'Kitty.',
            avatar: 'https://picsum.photos/40/40?random=1',
            comment: '🌹',
            timeAgo: '4 ngày',
            likes: 2777,
            isLiked: false,
            replies: [{ id: 'r1', username: 'User', avatar: '', comment: 'Reply', timeAgo: '1 ngày', likes: 0, isLiked: false }]
        },
        {
            id: '2',
            username: '@ yêu đi rồi Khóc 94',
            avatar: 'https://picsum.photos/40/40?random=2',
            comment: 'chính xác 90% là cheney trần',
            timeAgo: '2 ngày',
            likes: 12,
            isLiked: false,
            replies: []
        },
        {
            id: '3',
            username: '我爱你',
            avatar: 'https://picsum.photos/40/40?random=3',
            comment: 'con rắn mạnh nhất tiktok 😭',
            timeAgo: '2 ngày',
            likes: 2076,
            isLiked: false,
            replies: []
        },
        {
            id: '4',
            username: '@con khùng#',
            avatar: 'https://picsum.photos/40/40?random=4',
            comment: '🇻🇳🇻🇳 rắn xa neo 😂😂😂',
            timeAgo: '1 ngày',
            likes: 60,
            isLiked: false,
            replies: []
        },
        {
            id: '5',
            username: 'User123',
            avatar: 'https://picsum.photos/40/40?random=5',
            comment: 'Video hay quá! 👏',
            timeAgo: '1 ngày',
            likes: 45,
            isLiked: true,
            replies: []
        },
        {
            id: '6',
            username: 'TikTokFan',
            avatar: 'https://picsum.photos/40/40?random=6',
            comment: 'Làm thêm video về chủ đề này đi bạn ơi',
            timeAgo: '12 giờ',
            likes: 8,
            isLiked: false,
            replies: []
        },
    ];

    const [commentsList, setCommentsList] = useState<Comment[]>(defaultComments);

    const handleSendComment = () => {
        if (newComment.trim()) {
            const comment: Comment = {
                id: Date.now().toString(),
                username: 'You',
                avatar: 'https://i.pravatar.cc/150?u=user',
                comment: newComment.trim(),
                timeAgo: 'now',
                likes: 0,
                isLiked: false,
            };
            setCommentsList([comment, ...commentsList]);
            onAddComment(newComment.trim());
            setNewComment('');
        }
    };

    const handleLikeComment = (commentId: string) => {
        setCommentsList(prev =>
            prev.map(comment =>
                comment.id === commentId
                    ? {
                        ...comment,
                        isLiked: !comment.isLiked,
                        likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1
                    }
                    : comment
            )
        );
    };

    const handleEmojiSelect = (emoji: string) => {
        setNewComment(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
    };

    const handleFocusInput = () => {
        inputRef.current?.focus();
    };

    const handleAvatarPress = (username: string) => {
        console.log('Navigate to profile:', username);
        // TODO: Navigate to user profile
    };

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <TouchableOpacity
                onPress={() => handleAvatarPress(item.username)}
                activeOpacity={0.8}
            >
                <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
            </TouchableOpacity>
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                    <Text style={styles.commentTime}>{item.timeAgo}</Text>
                </View>
                <Text style={styles.commentText}>{item.comment}</Text>
                <View style={styles.commentMeta}>
                    <TouchableOpacity
                        onPress={() => handleLikeComment(item.id)}
                        activeOpacity={0.7}
                        style={styles.replyLink}
                    >
                        <Text style={styles.replyLinkText}>Trả lời</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.likeButton}
                        onPress={() => handleLikeComment(item.id)}
                        activeOpacity={0.7}
                    >
                        <Ionicons
                            name={item.isLiked ? 'heart' : 'heart-outline'}
                            size={14}
                            color={item.isLiked ? '#FE2C55' : '#666'}
                        />
                        <Text style={[
                            styles.likeCount,
                            { color: item.isLiked ? '#FE2C55' : '#666' }
                        ]}>
                            {item.likes.toLocaleString()}
                        </Text>
                    </TouchableOpacity>
                </View>
                {item.replies && item.replies.length > 0 && (
                    <TouchableOpacity style={styles.viewRepliesButton}>
                        <Text style={styles.viewRepliesText}>Xem {item.replies.length} câu trả lời</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.modalOverlay}>
                    <TouchableWithoutFeedback onPress={() => {}}>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    transform: [{ translateY }]
                                }
                            ]}
                        >
                    {/* Drag Handle */}
                    <View style={styles.dragHandle} {...headerPanResponder.panHandlers} />

                    <View style={styles.modalHeader} {...headerPanResponder.panHandlers}>
                                <View style={{ width: 32 }} />
                                <Text style={styles.modalTitle}>
                                    {commentsList.length} bình luận
                                </Text>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TouchableOpacity style={styles.sortButton}>
                                        <Ionicons name="funnel-outline" size={18} color="#000" />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                        <Ionicons name="close" size={20} color="#000" />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <FlatList
                                data={commentsList}
                                renderItem={renderComment}
                                keyExtractor={(item) => item.id}
                                style={styles.commentsList}
                                contentContainerStyle={styles.commentsContainer}
                                showsVerticalScrollIndicator={true}
                                scrollEnabled={true}
                                nestedScrollEnabled={true}
                                bounces={true}
                                scrollEventThrottle={16}
                                keyboardShouldPersistTaps="handled"
                                removeClippedSubviews={false}
                                scrollsToTop={false}
                                getItemLayout={(data, index) => ({
                                    length: 80, // Approximate height of each comment
                                    offset: 80 * index,
                                    index,
                                })}
                                initialNumToRender={10}
                                maxToRenderPerBatch={5}
                                windowSize={10}
                                ListEmptyComponent={() => (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="chatbubble-outline" size={48} color="#666" />
                                        <Text style={styles.emptyText}>No comments yet</Text>
                                        <Text style={styles.emptySubText}>Be the first to comment!</Text>
                                    </View>
                                )}
                            />

                            {showEmojiPicker && (
                                <View style={styles.emojiPicker}>
                                    <FlatList
                                        data={emojis}
                                        horizontal
                                        showsHorizontalScrollIndicator={false}
                                        keyExtractor={(item, index) => `emoji-${index}`}
                                        renderItem={({ item }) => (
                                            <TouchableOpacity
                                                style={styles.emojiButton}
                                                onPress={() => handleEmojiSelect(item)}
                                                activeOpacity={0.6}
                                            >
                                                <Text style={styles.emojiText}>{item}</Text>
                                            </TouchableOpacity>
                                        )}
                                        contentContainerStyle={styles.emojiList}
                                    />
                                </View>
                            )}

                            <KeyboardAvoidingView
                                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                                style={styles.inputContainer}
                            >
                                <View style={styles.inputWrapper}>
                                    <Image 
                                        source={{ uri: 'https://i.pravatar.cc/150?u=user' }} 
                                        style={styles.userAvatar} 
                                    />
                                    <TextInput
                                        ref={inputRef}
                                        style={styles.commentInput}
                                        placeholder="Thêm bình luận..."
                                        placeholderTextColor="#666"
                                        value={newComment}
                                        onChangeText={setNewComment}
                                        multiline
                                        maxLength={500}
                                        returnKeyType="done"
                                        onSubmitEditing={handleSendComment}
                                    />
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="image-outline" size={20} color="#666" />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.imageButton}
                                        onPress={toggleEmojiPicker}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons
                                            name={showEmojiPicker ? "remove-circle-outline" : "happy-outline"}
                                            size={22}
                                            color={showEmojiPicker ? "#FE2C55" : "#666"}
                                        />
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.iconButton}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="at" size={20} color="#666" />
                                    </TouchableOpacity>
                                </View>
                            </KeyboardAvoidingView>
                        </Animated.View>
                    </TouchableWithoutFeedback>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

export default VideoCommentModal;