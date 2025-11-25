import React, { useState, useRef, useCallback } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UNKNOWN_AVATAR } from "../../Utils/ImageUrlHelper";
import userService from "../../Services/UserService";

interface CommentInputBarProps {
  feedItemId: string;
  onCommentAdded?: () => void;
  placeholder?: string;
}

export default function CommentInputBar({
  feedItemId,
  onCommentAdded,
  placeholder = "Thêm bình luận...",
}: CommentInputBarProps) {
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentUserAvatar, setCurrentUserAvatar] = useState<string>("");
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const hasTypedText = comment.trim().length > 0;
  const quickEmojis = ["😯", "😁", "🥰"];

  // Load current user avatar
  React.useEffect(() => {
    const loadAvatar = async () => {
      try {
        const userDetail = await userService.getMyDetail();
        if (userDetail.avatarUrl) {
          setCurrentUserAvatar(userDetail.avatarUrl);
        }
      } catch (error) {
        console.error("Error loading user avatar:", error);
      }
    };
    loadAvatar();
  }, []);

  const submitComment = useCallback(
    async (content: string) => {
      if (!content.trim() || isSubmitting) return;

      try {
        setIsSubmitting(true);
        const commentService = (
          await import("../../Services/CommentService")
        ).default;
        await commentService.addComment(feedItemId, content.trim());

        setComment("");
        if (onCommentAdded) {
          onCommentAdded();
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [feedItemId, isSubmitting, onCommentAdded]
  );

  const handleSend = () => submitComment(comment);

  const handleEmojiPress = (emoji: string) => {
    submitComment(emoji);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View
        style={[
          styles.barContainer,
          { paddingBottom: Math.max(insets.bottom, 12) },
        ]}
      >
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.commentInput}
            placeholder={placeholder}
            placeholderTextColor="rgba(255, 255, 255, 0.55)"
            value={comment}
            onChangeText={setComment}
            multiline={false}
            maxLength={500}
            returnKeyType="send"
            onSubmitEditing={handleSend}
            editable={!isSubmitting}
            numberOfLines={1}
          />
        </View>

        <View style={styles.quickEmojiRow}>
          {quickEmojis.map((emoji) => (
            <TouchableOpacity
              key={emoji}
              style={styles.emojiButton}
              onPress={() => handleEmojiPress(emoji)}
              disabled={isSubmitting}
            >
              <Text style={styles.emojiText}>{emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.avatarButton}
          onPress={handleSend}
          activeOpacity={0.85}
          disabled={!hasTypedText || isSubmitting}
        >
          <Image
            source={
              currentUserAvatar &&
              currentUserAvatar !== "https://i.pravatar.cc/150?u=default"
                ? { uri: currentUserAvatar }
                : UNKNOWN_AVATAR
            }
            style={styles.userAvatar}
          />
          {hasTypedText && (
            <View style={styles.avatarOverlay}>
              <Ionicons
                name={isSubmitting ? "hourglass-outline" : "paper-plane"}
                size={16}
                color="#fff"
              />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    backgroundColor: "transparent",
  },
  barContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 6,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(18,18,18,0.92)",
    borderRadius: 999,
    paddingHorizontal: 16,
    minHeight: 40,
    borderWidth: 0.8,
    borderColor: "rgba(255,255,255,0.25)",
  },
  commentInput: {
    flex: 1,
    color: "#fff",
    fontSize: 15,
    fontFamily: "TikTokSans-Regular",
    paddingVertical: 0,
    marginRight: 0,
    lineHeight: 20,
  },
  quickEmojiRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  emojiButton: {
    paddingHorizontal: 4,
    paddingVertical: 2,
    marginLeft: 6,
  },
  emojiText: {
    fontSize: 18,
  },
  avatarButton: {
    marginLeft: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatar: {
    width: "100%",
    height: "100%",
  },
  avatarOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
});

