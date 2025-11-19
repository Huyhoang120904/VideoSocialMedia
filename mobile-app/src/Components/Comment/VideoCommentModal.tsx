import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";
import commentService from "../../Services/CommentService";
import userService from "../../Services/UserService";

const { height } = Dimensions.get("window");

interface Comment {
  id: string;
  username: string;
  avatar?: string | null;
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
  feedItemType?: "VIDEO" | "IMAGE_SLIDE";
  // comments prop đã bị XÓA - không cần nữa vì component tự load từ API
  onAddComment: (comment: string) => void;
  onUpdateCommentCount?: (newCount: number) => void; // Callback để update số lượng
}

const VideoCommentModal: React.FC<VideoCommentModalProps> = ({
  visible,
  onClose,
  videoId,
  feedItemType = "VIDEO",
  // comments đã bị XÓA khỏi destructuring
  onAddComment,
  onUpdateCommentCount, // Nhận callback
}) => {
  console.log(`videoId`, videoId);

  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [commentsList, setCommentsList] = useState<Comment[]>([]);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string | null>(
    null
  );
  const [currentUserName, setCurrentUserName] = useState<string>("You");
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = React.useRef<TextInput>(null);
  const translateY = useRef(new Animated.Value(0)).current;

  // Load current user avatar khi mở modal
  useEffect(() => {
    const loadCurrentUserAvatar = async () => {
      try {
        const userDetail = await userService.getMyDetail();
        setCurrentUserAvatar(userDetail.avatarUrl || null);
        setCurrentUserName(
          userDetail.displayName ||
            userDetail.shownName ||
            userDetail.id ||
            "You"
        );
      } catch (error) {
        console.error("Error loading current user avatar:", error);
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

      console.log("📝 Comments loaded from API:", response.content.length);
      console.log("📝 Total elements from API:", response.totalElements);
      console.log(
        "📝 Comment IDs:",
        response.content.map((c) => c.id)
      );

      // Map backend response sang Comment interface của component
      const mappedComments: Comment[] = response.content.map((comment) => {
        console.log(
          `⏰ Comment timeAgo: "${comment.timeAgo}" | createdAt: ${comment.createdAt}`
        );

        return {
          id: comment.id,
          username: comment.username || "User",
          avatar: comment.avatarUrl || null,
          comment: comment.content,
          timeAgo: comment.timeAgo || "vừa xong", // Backend đã format sẵn
          likes: comment.likeCount || 0,
          isLiked: comment.isLikedByCurrentUser || false,
          replies: [],
        };
      });

      console.log("📝 Mapped comments count:", mappedComments.length);
      console.log(
        "📝 About to set commentsList with:",
        mappedComments.length,
        "comments"
      );

      setCommentsList(mappedComments);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const headerPanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (evt, gestureState) => {
      // Only respond to downward gestures
      return (
        Math.abs(gestureState.dy) > Math.abs(gestureState.dx) &&
        gestureState.dy > 0
      );
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

  const emojis = [
    "😀",
    "😂",
    "🥰",
    "😍",
    "🤩",
    "😎",
    "🔥",
    "💯",
    "👏",
    "❤️",
    "💕",
    "",
    "😱",
    "🤔",
    "👍",
    "👎",
    "🙏",
    "💪",
    "✨",
    "🎉",
  ];

  // defaultComments đã được XÓA - chỉ dùng comments từ database thông qua loadComments()

  const handleSendComment = async () => {
    if (!newComment.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Gọi API để lưu comment vào database - response có cả comment và totalComments
      const response = await commentService.addComment(
        videoId,
        newComment.trim()
      );

      console.log(
        `✅ New comment added - timeAgo: "${response.comment.timeAgo}"`
      );

      // Thêm comment mới vào đầu danh sách (từ backend response)
      const comment: Comment = {
        id: response.comment.id,
        username: response.comment.username || "You",
        avatar: response.comment.avatarUrl || null,
        comment: response.comment.content,
        timeAgo: response.comment.timeAgo || "vừa xong", // Backend trả về
        likes: response.comment.likeCount || 0,
        isLiked: response.comment.isLikedByCurrentUser || false,
      };
      setCommentsList([comment, ...commentsList]);
      onAddComment(newComment.trim());

      // Lưu avatar của user để hiển thị ở input box
      setCurrentUserAvatar(response.comment.avatarUrl || null);

      // Cập nhật số lượng comment về component cha
      if (onUpdateCommentCount) {
        onUpdateCommentCount(response.totalComments);
      }

      setNewComment("");
    } catch (error) {
      console.error("Error adding comment:", error);
      Alert.alert("Lỗi", "Không thể thêm bình luận. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      // Tìm comment hiện tại để biết trạng thái liked
      const currentComment = commentsList.find((c) => c.id === commentId);
      if (!currentComment) return;

      const isCurrentlyLiked = currentComment.isLiked || false;

      // Optimistic UI update
      setCommentsList((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !isCurrentlyLiked,
                likes: isCurrentlyLiked ? comment.likes - 1 : comment.likes + 1,
              }
            : comment
        )
      );

      // Gọi API
      const response = await commentService.toggleCommentLike(
        commentId,
        isCurrentlyLiked
      );

      // Update với số liệu thật từ backend
      setCommentsList((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: response.liked,
                likes: response.likeCount,
              }
            : comment
        )
      );
    } catch (error) {
      console.error("Error liking comment:", error);
      // Rollback optimistic update
      setCommentsList((prev) =>
        prev.map((comment) =>
          comment.id === commentId
            ? {
                ...comment,
                isLiked: !comment.isLiked,
                likes: comment.isLiked ? comment.likes + 1 : comment.likes - 1,
              }
            : comment
        )
      );
      Alert.alert("Lỗi", "Không thể thực hiện thao tác. Vui lòng thử lại.");
    }
  };

  const handleEmojiSelect = (emoji: string) => {
    setNewComment((prev) => prev + emoji);
    setShowEmojiPicker(false);
  };

  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const handleFocusInput = () => {
    inputRef.current?.focus();
  };

  const handleAvatarPress = (username: string) => {
    console.log("Navigate to profile:", username);
    // TODO: Navigate to user profile
  };

  const getAvatarInitial = (name?: string) =>
    name?.charAt(0).toUpperCase() || "?";

  const renderComment = ({ item }: { item: Comment }) => (
    <View style={styles.commentItem}>
      <TouchableOpacity
        onPress={() => handleAvatarPress(item.username)}
        activeOpacity={0.8}
      >
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.commentAvatar} />
        ) : (
          <View style={[styles.commentAvatar, styles.initialAvatar]}>
            <Text style={styles.initialAvatarText}>
              {getAvatarInitial(item.username)}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      <View style={styles.commentContent}>
        <View style={styles.commentTopRow}>
          <View style={styles.commentLeft}>
            <Text style={styles.commentUsername}>{item.username}</Text>
            <Text style={styles.commentText}>{item.comment}</Text>
            <View style={styles.commentMeta}>
              <Text style={styles.commentTime}>{item.timeAgo}</Text>
              <TouchableOpacity activeOpacity={0.7} style={styles.replyLink}>
                <Text style={styles.replyLinkText}>Trả lời</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.likeButton}
                onPress={() => handleLikeComment(item.id)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.isLiked ? "heart" : "heart-outline"}
                  size={16}
                  color={item.isLiked ? "#FE2C55" : "#666"}
                />
                <Text
                  style={[
                    styles.likeCount,
                    { color: item.isLiked ? "#FE2C55" : "#666" },
                  ]}
                >
                  {item.likes >= 1000
                    ? `${(item.likes / 1000).toFixed(1)} N`
                    : item.likes}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.dislikeButton}
                activeOpacity={0.7}
              >
                <Ionicons name="thumbs-down" size={16} color="#666" />
              </TouchableOpacity>
            </View>
            {item.replies && item.replies.length > 0 && (
              <TouchableOpacity style={styles.viewRepliesButton}>
                <Text style={styles.viewRepliesText}>
                  Xem {item.replies.length} câu trả lời
                </Text>
                <Ionicons
                  name="chevron-down"
                  size={12}
                  color="#666"
                  style={{ marginLeft: 4 }}
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
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
                  transform: [{ translateY }],
                },
              ]}
            >
              {/* Header with Search */}
              <View
                style={styles.modalHeader}
                {...headerPanResponder.panHandlers}
              >
                <TouchableOpacity style={styles.filterButton}>
                  <Ionicons name="options-outline" size={20} color="#000" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.searchTitleContainer}>
                  <Text style={styles.searchLabel}>Tìm kiếm: </Text>
                  <Text style={styles.searchText} numberOfLines={1}>
                    {searchQuery || "bé điều hỏi xưa con trai"}
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
                        <Text style={styles.emptyText}>
                          Đang tải bình luận...
                        </Text>
                      </>
                    ) : (
                      <>
                        <Ionicons
                          name="chatbubble-outline"
                          size={48}
                          color="#666"
                        />
                        <Text style={styles.emptyText}>Chưa có bình luận</Text>
                        <Text style={styles.emptySubText}>
                          Hãy là người đầu tiên bình luận!
                        </Text>
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
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={styles.inputContainer}
              >
                {currentUserAvatar ? (
                  <Image
                    source={{ uri: currentUserAvatar }}
                    style={styles.userAvatar}
                  />
                ) : (
                  <View style={[styles.userAvatar, styles.initialAvatar]}>
                    <Text style={styles.initialAvatarText}>
                      {getAvatarInitial(currentUserName)}
                    </Text>
                  </View>
                )}
                <View style={styles.inputWrapper}>
                  <TextInput
                    ref={inputRef}
                    style={styles.commentInput}
                    placeholder="Thêm bình luận..."
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
                </View>
                <TouchableOpacity
                  style={styles.sendButton}
                  onPress={handleSendComment}
                  activeOpacity={0.7}
                  disabled={!newComment.trim() || isSubmitting}
                >
                  <Ionicons
                    name={isSubmitting ? "hourglass-outline" : "send"}
                    size={20}
                    color={
                      newComment.trim() && !isSubmitting ? "#FE2C55" : "#999"
                    }
                  />
                </TouchableOpacity>
              </KeyboardAvoidingView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

export default VideoCommentModal;
