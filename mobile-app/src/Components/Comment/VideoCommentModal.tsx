import React, { useState, useRef, useEffect } from 'react';
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
    Alert,
    ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import styles from './styles';
import commentService from '../../Services/CommentService';
import userService from '../../Services/UserService';
import { UNKNOWN_AVATAR } from '../../Utils/ImageUrlHelper';

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
    replyCount?: number;
    parentCommentId?: string;
}

interface VideoCommentModalProps {
    visible: boolean;
    onClose: () => void;
    videoId: string;
    feedItemType?: 'VIDEO' | 'IMAGE_SLIDE';
    // comments prop đã bị XÓA - không cần nữa vì component tự load từ API
    onAddComment: (comment: string) => void;
    onUpdateCommentCount?: (newCount: number) => void; // Callback để update số lượng
}

const VideoCommentModal: React.FC<VideoCommentModalProps> = ({
    visible,
    onClose,
    videoId,
    feedItemType = 'VIDEO',
    // comments đã bị XÓA khỏi destructuring
    onAddComment,
    onUpdateCommentCount, // Nhận callback
}) => {
    const [newComment, setNewComment] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [commentsList, setCommentsList] = useState<Comment[]>([]);
    const [currentUserAvatar, setCurrentUserAvatar] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [replyingTo, setReplyingTo] = useState<Comment | null>(null); // Comment đang được reply
    const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set()); // Set các comment ID đã mở replies
    const [repliesMap, setRepliesMap] = useState<Map<string, Comment[]>>(new Map()); // Map comment ID -> replies
    const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set()); // Set các comment ID đang load replies
    const inputRef = React.useRef<TextInput>(null);
    const translateY = useRef(new Animated.Value(0)).current;

    // Load current user avatar khi mở modal
    useEffect(() => {
        const loadCurrentUserAvatar = async () => {
            try {
                const userDetail = await userService.getMyDetail();
                if (userDetail.avatarUrl) {
                    setCurrentUserAvatar(userDetail.avatarUrl);
                }
            } catch (error) {
                console.error('Error loading current user avatar:', error);
                // Giữ placeholder nếu lỗi
            }
        };

        if (visible) {
            loadCurrentUserAvatar();
        }
    }, [visible]);

    // Load comments khi mở modal
    useEffect(() => {
        if (visible && videoId) {
            // Reset commentsList trước khi load để tránh hiển thị data cũ
            setCommentsList([]);
            loadComments();
        } else if (!visible) {
            // Reset khi đóng modal để tránh cache
            setCommentsList([]);
        }
}, [visible, videoId]);

    const loadComments = async () => {
        try {
            setIsLoading(true);
            const response = await commentService.getComments(videoId, 0, 50);

            console.log('📝 Comments loaded from API:', response.content.length);
            console.log('📝 Total elements from API:', response.totalElements);
            console.log('📝 Comment IDs:', response.content.map(c => c.id));

            // Map backend response sang Comment interface của component
            const mappedComments: Comment[] = response.content.map((comment) => {
                console.log(`⏰ Comment timeAgo: "${comment.timeAgo}" | createdAt: ${comment.createdAt}`);

                return {
                    id: comment.id,
                    username: comment.username || 'User',
                    avatar: comment.avatarUrl || '',
                    comment: comment.content,
                    timeAgo: comment.timeAgo || 'vừa xong', // Backend đã format sẵn
                    likes: comment.likeCount || 0,
                    isLiked: comment.isLikedByCurrentUser || false,
                    replies: [],
                    replyCount: comment.replyCount || 0,
                    parentCommentId: comment.parentCommentId,
                };
            });

            console.log('📝 Mapped comments count:', mappedComments.length);
            console.log('📝 About to set commentsList with:', mappedComments.length, 'comments');

            setCommentsList(mappedComments);
        } catch (error) {
            console.error('Error loading comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const headerPanResponder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (evt, gestureState) => {
            // Only respond to downward gestures
            return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
        },
        onPanResponderGrant: () => {
            // Reset any ongoing animations
            // @ts-ignore - _value is internal but safe to use
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

    // defaultComments đã được XÓA - chỉ dùng comments từ database thông qua loadComments()

    const handleSendComment = async () => {
        if (!newComment.trim() || isSubmitting) return;

        try {
            setIsSubmitting(true);

            let response;
            if (replyingTo) {
                // Reply to a comment
                response = await commentService.replyComment(
                    videoId,
                    replyingTo.id,
                    newComment.trim()
                );
                console.log(`✅ Reply added - timeAgo: "${response.comment.timeAgo}"`);

                // Thêm reply vào repliesMap
                const newReply: Comment = {
                    id: response.comment.id,
                    username: response.comment.username || 'You',
                    avatar: response.comment.avatarUrl || '',
                    comment: response.comment.content,
                    timeAgo: response.comment.timeAgo || 'vừa xong',
                    likes: response.comment.likeCount || 0,
                    isLiked: response.comment.isLikedByCurrentUser || false,
                    replies: [],
                    replyCount: 0,
                    parentCommentId: replyingTo.id,
                };

                setRepliesMap(prev => {
                    const newMap = new Map(prev);
                    const existingReplies = newMap.get(replyingTo.id) || [];
                    newMap.set(replyingTo.id, [newReply, ...existingReplies]);
                    return newMap;
                });

                // Update reply count in parent comment
                setCommentsList(prev =>
                    prev.map(comment =>
                        comment.id === replyingTo.id
                            ? { ...comment, replyCount: (comment.replyCount || 0) + 1 }
                            : comment
                    )
                );

                // Expand replies if not already expanded
                if (!expandedReplies.has(replyingTo.id)) {
                    setExpandedReplies(prev => new Set(prev).add(replyingTo.id));
                }
            } else {
                // Add new top-level comment
                response = await commentService.addComment(
                    videoId,
                    newComment.trim()
                );

                console.log(`✅ New comment added - timeAgo: "${response.comment.timeAgo}"`);

                // Thêm comment mới vào đầu danh sách (từ backend response)
                const comment: Comment = {
                    id: response.comment.id,
                    username: response.comment.username || 'You',
                    avatar: response.comment.avatarUrl || '',
                    comment: response.comment.content,
                    timeAgo: response.comment.timeAgo || 'vừa xong', // Backend trả về
                    likes: response.comment.likeCount || 0,
                    isLiked: response.comment.isLikedByCurrentUser || false,
                    replies: [],
                    replyCount: response.comment.replyCount || 0,
                };
                setCommentsList([comment, ...commentsList]);
                onAddComment(newComment.trim());

                // Cập nhật số lượng comment về component cha
                if (onUpdateCommentCount) {
                    onUpdateCommentCount(response.totalComments);
                }
            }

            // Lưu avatar của user để hiển thị ở input box
            if (response.comment.avatarUrl) {
                setCurrentUserAvatar(response.comment.avatarUrl);
            }

            setNewComment('');
            setReplyingTo(null);

        } catch (error) {
            console.error('Error adding comment:', error);
            Alert.alert('Lỗi', 'Không thể thêm bình luận. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLikeComment = async (commentId: string) => {
        try {
            // Tìm comment hiện tại để biết trạng thái liked
            const currentComment = commentsList.find(c => c.id === commentId);
            if (!currentComment) return;

            const isCurrentlyLiked = currentComment.isLiked || false;

            // Optimistic UI update
            setCommentsList(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            isLiked: !isCurrentlyLiked,
                            likes: isCurrentlyLiked ? comment.likes - 1 : comment.likes + 1
                        }
                        : comment
                )
            );

            // Gọi API
const response = await commentService.toggleCommentLike(commentId, isCurrentlyLiked);

            // Update với số liệu thật từ backend
            setCommentsList(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            isLiked: response.liked,
                            likes: response.likeCount
                        }
                        : comment
                )
            );

        } catch (error) {
            console.error('Error liking comment:', error);
            // Rollback optimistic update
            setCommentsList(prev =>
                prev.map(comment =>
                    comment.id === commentId
                        ? {
                            ...comment,
                            isLiked: !comment.isLiked,
                            likes: comment.isLiked ? comment.likes + 1 : comment.likes - 1
                        }
                        : comment
                )
            );
            Alert.alert('Lỗi', 'Không thể thực hiện thao tác. Vui lòng thử lại.');
        }
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

    const handleReplyPress = (comment: Comment) => {
        setReplyingTo(comment);
        inputRef.current?.focus();
    };

    const handleCancelReply = () => {
        setReplyingTo(null);
    };

    const handleLoadReplies = async (commentId: string) => {
        if (loadingReplies.has(commentId) || repliesMap.has(commentId)) {
            // Toggle expanded state
            setExpandedReplies(prev => {
                const newSet = new Set(prev);
                if (newSet.has(commentId)) {
                    newSet.delete(commentId);
                } else {
                    newSet.add(commentId);
                }
                return newSet;
            });
            return;
        }

        try {
            setLoadingReplies(prev => new Set(prev).add(commentId));
            const response = await commentService.getReplies(commentId, 0, 50);

            const mappedReplies: Comment[] = response.content.map((reply) => ({
                id: reply.id,
                username: reply.username || 'User',
                avatar: reply.avatarUrl || '',
                comment: reply.content,
                timeAgo: reply.timeAgo || 'vừa xong',
                likes: reply.likeCount || 0,
                isLiked: reply.isLikedByCurrentUser || false,
                replies: [],
                replyCount: reply.replyCount || 0,
                parentCommentId: reply.parentCommentId,
            }));

            setRepliesMap(prev => {
                const newMap = new Map(prev);
                newMap.set(commentId, mappedReplies);
                return newMap;
            });

            setExpandedReplies(prev => new Set(prev).add(commentId));
        } catch (error) {
            console.error('Error loading replies:', error);
            Alert.alert('Lỗi', 'Không thể tải câu trả lời. Vui lòng thử lại.');
        } finally {
            setLoadingReplies(prev => {
                const newSet = new Set(prev);
                newSet.delete(commentId);
                return newSet;
            });
        }
    };

    const renderReply = (reply: Comment, parentId: string) => (
        <View key={reply.id} style={[styles.commentItem, styles.replyItem]}>
            <TouchableOpacity
                onPress={() => handleAvatarPress(reply.username)}
                activeOpacity={0.8}
            >
                <Image
                    source={reply.avatar ? { uri: reply.avatar } : UNKNOWN_AVATAR}
                    style={styles.commentAvatar}
                />
            </TouchableOpacity>
            <View style={styles.commentContent}>
                <View style={styles.commentTopRow}>
                    <View style={styles.commentLeft}>
                        <Text style={styles.commentUsername}>{reply.username}</Text>
                        <Text style={styles.commentText}>{reply.comment}</Text>
                        <View style={styles.commentMeta}>
                            <Text style={styles.commentTime}>{reply.timeAgo}</Text>
                            <TouchableOpacity
                                activeOpacity={0.7}
                                style={styles.replyLink}
                                onPress={() => handleReplyPress(reply)}
                            >
                                <Text style={styles.replyLinkText}>Trả lời</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.likeButton}
                                onPress={() => handleLikeComment(reply.id)}
                                activeOpacity={0.7}
                            >
                                <Ionicons
                                    name={reply.isLiked ? 'heart' : 'heart-outline'}
                                    size={16}
                                    color={reply.isLiked ? '#FE2C55' : '#666'}
                                />
                                <Text style={[
                                    styles.likeCount,
                                    { color: reply.isLiked ? '#FE2C55' : '#666' }
                                ]}>
                                    {reply.likes >= 1000 ? `${(reply.likes / 1000).toFixed(1)} N` : reply.likes}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderComment = ({ item }: { item: Comment }) => {
        const isExpanded = expandedReplies.has(item.id);
        const replies = repliesMap.get(item.id) || [];
        const hasReplies = (item.replyCount || 0) > 0 || replies.length > 0;
        const isLoadingReplies = loadingReplies.has(item.id);

        return (
            <View style={styles.commentItem}>
                <TouchableOpacity
                    onPress={() => handleAvatarPress(item.username)}
                    activeOpacity={0.8}
                >
                    <Image
                        source={item.avatar ? { uri: item.avatar } : UNKNOWN_AVATAR}
                        style={styles.commentAvatar}
                    />
                </TouchableOpacity>
                <View style={styles.commentContent}>
                    <View style={styles.commentTopRow}>
                        <View style={styles.commentLeft}>
                            <Text style={styles.commentUsername}>{item.username}</Text>
                            <Text style={styles.commentText}>{item.comment}</Text>
                            <View style={styles.commentMeta}>
                                <Text style={styles.commentTime}>{item.timeAgo}</Text>
                                <TouchableOpacity
                                    activeOpacity={0.7}
                                    style={styles.replyLink}
                                    onPress={() => handleReplyPress(item)}
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
                                        size={16}
                                        color={item.isLiked ? '#FE2C55' : '#666'}
                                    />
                                    <Text style={[
                                        styles.likeCount,
                                        { color: item.isLiked ? '#FE2C55' : '#666' }
                                    ]}>
                                        {item.likes >= 1000 ? `${(item.likes / 1000).toFixed(1)} N` : item.likes}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                            {hasReplies && (
                                <TouchableOpacity
                                    style={styles.viewRepliesButton}
                                    onPress={() => handleLoadReplies(item.id)}
                                    disabled={isLoadingReplies}
                                >
                                    {isLoadingReplies ? (
                                        <ActivityIndicator size="small" color="#FE2C55" />
                                    ) : (
                                        <>
                                            <Text style={styles.viewRepliesText}>
                                                {isExpanded ? 'Ẩn' : 'Xem'} {item.replyCount || replies.length} câu trả lời
                                            </Text>
                                            <Ionicons
                                                name={isExpanded ? "chevron-up" : "chevron-down"}
                                                size={12}
                                                color="#666"
                                                style={{ marginLeft: 4 }}
                                            />
                                        </>
                                    )}
                                </TouchableOpacity>
                            )}
                            {isExpanded && replies.length > 0 && (
                                <View style={styles.repliesContainer}>
                                    {replies.map(reply => renderReply(reply, item.id))}
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
    };

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
                            {/* Header with Search */}
                            <View style={styles.modalHeader} {...headerPanResponder.panHandlers}>
                                <TouchableOpacity style={styles.filterButton}>
                                    <Ionicons name="options-outline" size={20} color="#000" />
                                </TouchableOpacity>
<TouchableOpacity style={styles.searchTitleContainer}>
                                    <Text style={styles.searchLabel}>Tìm kiếm: </Text>
                                    <Text style={styles.searchText} numberOfLines={1}>
                                        {searchQuery || 'bé điều hỏi xưa con trai'}
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                                    <Ionicons name="close" size={22} color="#000" />
                                </TouchableOpacity>
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
                                        {isLoading ? (
                                            <>
                                                <ActivityIndicator size="large" color="#FE2C55" />
                                                <Text style={styles.emptyText}>Đang tải bình luận...</Text>
                                            </>
                                        ) : (
                                            <>
                                                <Ionicons name="chatbubble-outline" size={48} color="#666" />
                                                <Text style={styles.emptyText}>Chưa có bình luận</Text>
                                                <Text style={styles.emptySubText}>Hãy là người đầu tiên bình luận!</Text>
                                            </>
                                        )}
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
                                {replyingTo && (
                                    <View style={styles.replyingToContainer}>
                                        <Text style={styles.replyingToText}>
                                            Đang trả lời <Text style={styles.replyingToUsername}>{replyingTo.username}</Text>
                                        </Text>
                                        <TouchableOpacity onPress={handleCancelReply}>
                                            <Ionicons name="close-circle" size={18} color="#666" />
                                        </TouchableOpacity>
                                    </View>
                                )}
                                <View style={styles.inputRow}>
                                    <Image
                                        source={currentUserAvatar && currentUserAvatar !== 'https://i.pravatar.cc/150?u=default'
                                            ? { uri: currentUserAvatar }
                                            : UNKNOWN_AVATAR}
                                        style={styles.userAvatar}
                                    />
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            ref={inputRef}
                                            style={styles.commentInput}
                                            placeholder={replyingTo ? `Trả lời ${replyingTo.username}...` : "Thêm bình luận..."}
                                            placeholderTextColor="#999"
                                            value={newComment}
                                            onChangeText={setNewComment}
                                            multiline={false}
                                            maxLength={500}
                                            returnKeyType="send"
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
                                                name={showEmojiPicker ? "close-circle" : "happy-outline"}
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
                                    {newComment.trim().length > 0 && (
                                        <TouchableOpacity
                                            style={styles.sendButton}
                                            onPress={handleSendComment}
                                            activeOpacity={0.7}
                                            disabled={isSubmitting}
                                        >
                                            <Ionicons
                                                name={isSubmitting ? "hourglass-outline" : "send"}
                                                size={20}
                                                color="#FE2C55"
                                            />
                                        </TouchableOpacity>
                                    )}
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