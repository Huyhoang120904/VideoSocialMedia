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

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: () => false,
        onPanResponderMove: (evt, gestureState) => {
            if (gestureState.dy > 0) {
                translateY.setValue(gestureState.dy);
            }
        },
        onPanResponderRelease: (evt, gestureState) => {
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

    // Sample TikTok-style comments
    const defaultComments: Comment[] = [
        {
            id: '1',
            username: '🍗🍟🍕',
            avatar: 'https://picsum.photos/40/40?random=1',
            comment: '127k luôn vạt đồ ăn và nước à shop',
            timeAgo: '23 giờ',
            likes: 0,
            isLiked: false,
            replies: []
        },
        {
            id: '2',
            username: 'Kha Han',
            avatar: 'https://picsum.photos/40/40?random=2',
            comment: 'có vạt k a',
            timeAgo: '23 giờ',
            likes: 2,
            isLiked: false,
            replies: []
        },
        {
            id: '3',
            username: 'Foresstella',
            avatar: 'https://picsum.photos/40/40?random=3',
            comment: 'những mà đi thực tế rồi mới thấy đồ ăn lúc nào cũng thừa thốt, ko được đầy đặn như trên clip 😂',
            timeAgo: '9 giờ',
            likes: 10,
            isLiked: false,
            replies: []
        },
        {
            id: '4',
            username: 'foodie2024',
            avatar: 'https://picsum.photos/40/40?random=4',
            comment: 'Nhìn ngon ghê 🤤',
            timeAgo: '5 giờ',
            likes: 15,
            isLiked: true,
            replies: []
        },
        {
            id: '5',
            username: 'vietnam_eats',
            avatar: 'https://picsum.photos/40/40?random=5',
            comment: 'Đói bụng quá rồi',
            timeAgo: '4 giờ',
            likes: 8,
            isLiked: false,
            replies: []
        },
        {
            id: '6',
            username: 'student_life',
            avatar: 'https://picsum.photos/40/40?random=6',
            comment: 'Tiền đâu mà ăn 😭',
            timeAgo: '3 giờ',
            likes: 25,
            isLiked: true,
            replies: []
        },
        {
            id: '7',
            username: 'saigon_boy',
            avatar: 'https://picsum.photos/40/40?random=7',
            comment: 'Shop ở đâu vậy admin?',
            timeAgo: '2 giờ',
            likes: 5,
            isLiked: false,
            replies: []
        },
        {
            id: '8',
            username: 'hungry_girl',
            avatar: 'https://picsum.photos/40/40?random=8',
            comment: 'Tối nay ăn gì đây 🤔',
            timeAgo: '1 giờ',
            likes: 12,
            isLiked: false,
            replies: []
        },
        {
            id: '9',
            username: 'food_lover',
            avatar: 'https://picsum.photos/40/40?random=9',
            comment: 'Giá cả thế nào?',
            timeAgo: '45 phút',
            likes: 3,
            isLiked: false,
            replies: []
        },
        {
            id: '10',
            username: 'midnight_eater',
            avatar: 'https://picsum.photos/40/40?random=10',
            comment: '3h sáng xem này là sai lầm 😭',
            timeAgo: '30 phút',
            likes: 18,
            isLiked: true,
            replies: []
        }
    ];

    const [commentsList, setCommentsList] = useState<Comment[]>(defaultComments);

    console.log('Comments count:', commentsList.length);
    console.log('Comments data:', commentsList.map(c => c.username));

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

    const renderComment = ({ item }: { item: Comment }) => (
        <View style={styles.commentItem}>
            <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
            <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                    <Text style={styles.commentUsername}>{item.username}</Text>
                </View>
                <Text style={styles.commentText}>{item.comment}</Text>
                <View style={styles.commentMeta}>
                    <Text style={styles.commentTime}>{item.timeAgo}</Text>
                    <TouchableOpacity
                        onPress={() => handleLikeComment(item.id)}
                        activeOpacity={0.7}
                        style={styles.replyLink}
                    >
                        <Text style={styles.replyLinkText}>Trả lời</Text>
                    </TouchableOpacity>
                    {item.likes > 0 && (
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
                                {item.likes}
                            </Text>
                        </TouchableOpacity>
                    )}
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
                    <TouchableWithoutFeedback onPress={() => { }}>
                        <Animated.View
                            style={[
                                styles.modalContainer,
                                {
                                    transform: [{ translateY }]
                                }
                            ]}
                        >

                            <View style={styles.modalHeader}>
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

                            <ScrollView
                                style={styles.commentsList}
                                contentContainerStyle={styles.commentsContainer}
                                showsVerticalScrollIndicator={true}
                                scrollEnabled={true}
                                nestedScrollEnabled={true}
                                bounces={true}
                                alwaysBounceVertical={true}
                                scrollEventThrottle={16}
                                onScroll={(event) => {
                                    console.log('ScrollView scrolling:', event.nativeEvent.contentOffset.y);
                                }}
                            >
                                {commentsList.length === 0 ? (
                                    <View style={styles.emptyContainer}>
                                        <Ionicons name="chatbubble-outline" size={48} color="#666" />
                                        <Text style={styles.emptyText}>No comments yet</Text>
                                        <Text style={styles.emptySubText}>Be the first to comment!</Text>
                                    </View>
                                ) : (
                                    <>
                                        {commentsList.map((item) => (
                                            <View key={item.id}>
                                                {renderComment({ item })}
                                            </View>
                                        ))}
                                    </>
                                )}
                            </ScrollView>

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
                                        onPress={handleSendComment}
                                        style={[
                                            styles.sendButton,
                                            {
                                                opacity: newComment.trim() ? 1 : 0.5,
                                                backgroundColor: newComment.trim() ? '#FE2C55' : 'rgba(254, 44, 85, 0.3)',
                                                transform: [{ scale: newComment.trim() ? 1 : 0.95 }]
                                            }
                                        ]}
                                        disabled={!newComment.trim()}
                                        activeOpacity={0.8}
                                    >
                                        <Ionicons name="send" size={18} color="#fff" />
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