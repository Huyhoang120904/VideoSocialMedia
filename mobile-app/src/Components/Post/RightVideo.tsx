import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Image,
  Text,
  Pressable,
  Animated,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useDispatch } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import { updateFeedItem } from "../../Store/feedSlice";
import { LikeService } from "../../Services/LoveService";
import {
  AntDesign,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import img from "../../../assets/avatar.png";
import styles from "./styles";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ShareVideoModal from "./ShareVideoModal";
import { useSafeBottomTabBarHeight } from "../../Hooks/useSafeBottomTabBarHeight";

const ICON_SIZE = 32; // Increased for better visibility

interface RightVideoProps {
  id: string;
  likes: number;
  comments: number;
  shares: number;
  outstanding: number;
  isLoved?: boolean; // Trạng thái đã yêu thích
  avatarUrl?: string; // Avatar URL của người upload
  uploaderUserId?: string; // UserDetail ID của người upload
  username?: string;
  onCommentPress?: () => void; // Callback khi nhấn nút comment
}

interface IconWithCountProps {
  icon: React.ReactNode;
  count: number;
  onPress?: () => void;
  containerStyle?: any; // Add custom style prop
}

const IconWithCount: React.FC<IconWithCountProps> = ({
  icon,
  count,
  onPress,
  containerStyle,
}) => (
  <Pressable style={containerStyle || styles.iconContainer} onPress={onPress}>
    {icon}
    <Text style={styles.iconText}>{count}</Text>
  </Pressable>
);

export default function RightVideo({
  id,
  likes,
  comments,
  shares,
  outstanding,
  isLoved = false,
  avatarUrl,
  uploaderUserId,
  username,
  onCommentPress,
}: RightVideoProps) {
  const dispatch = useDispatch();
  const navigation = useNavigation<any>();
  const [liked, setLiked] = useState(isLoved); // Khởi tạo từ prop isLoved
  const [currentLikes, setCurrentLikes] = useState(likes); // Track likes locally
  const [currentComments, setCurrentComments] = useState(comments); // Track comments locally
  const [shareModalVisible, setShareModalVisible] = useState(false);

  // Animations
  const likeScale = useRef(new Animated.Value(1)).current;
  const musicRotation = useRef(new Animated.Value(0)).current;

  // commentsList đã bị XÓA - VideoCommentModal tự load comments từ API

  // Sync liked state with isLoved prop
  useEffect(() => {
    setLiked(isLoved);
  }, [isLoved]);

  // Sync likes count with prop
  useEffect(() => {
    setCurrentLikes(likes);
  }, [likes]);

  // Sync comments count with prop
  useEffect(() => {
    setCurrentComments(comments);
  }, [comments]);

  // Rotating music disc animation
  useEffect(() => {
    Animated.loop(
      Animated.timing(musicRotation, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const spin = musicRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  // Compute bottom position dynamically so RightVideo aligns with BottomVideo
  // and the tab bar icons across devices (mirrors BottomVideo logic).
  const tabBarHeight = useSafeBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const EXTRA_SPACING = 0; // tuned down after runtime logs
  const visualTabIconsHeight = Math.max(tabBarHeight - insets.bottom, 0);
  const bottomPosition = visualTabIconsHeight + EXTRA_SPACING;

  // Log runtime values to debug bottom alignment
  useEffect(() => {
    try {
      console.log(
        "[RightVideo] tabBarHeight:",
        tabBarHeight,
        "insets.bottom:",
        insets.bottom,
        "visualTabIconsHeight:",
        visualTabIconsHeight,
        "bottomPosition:",
        bottomPosition
      );
    } catch (e) {
      // ignore
    }
  }, [tabBarHeight, insets.bottom, visualTabIconsHeight, bottomPosition]);

  const handleLike = async () => {
    console.log("[RightVideo] ========== handleLike called ==========");
    console.log("[RightVideo] FeedItem ID:", id);
    console.log("[RightVideo] Current state:", { liked, currentLikes });
    console.log("[RightVideo] ID type:", typeof id);
    console.log("[RightVideo] ID length:", id?.length);

    // Validate ID before proceeding
    if (!id || id === "undefined" || id === "null") {
      console.error("[RightVideo] ❌ Invalid feedItem ID:", id);
      Alert.alert("Lỗi", "ID không hợp lệ. Không thể thực hiện thao tác.");
      return;
    }

    // Animate like button
    Animated.sequence([
      Animated.timing(likeScale, {
        toValue: 1.3,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(likeScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    const newLikedState = !liked;
    const previousLikes = currentLikes;
    const optimisticLikes = newLikedState ? currentLikes + 1 : currentLikes - 1;

    console.log("[RightVideo] Optimistic update", {
      newLikedState,
      previousLikes,
      optimisticLikes,
    });

    // Bước 1: Cập nhật UI ngay lập tức (optimistic update)
    setLiked(newLikedState);
    setCurrentLikes(optimisticLikes);
    dispatch(
      updateFeedItem({
        id,
        updates: {
          loved: newLikedState,
          likes: optimisticLikes,
        },
      })
    );

    // Bước 2: Gọi API backend
    try {
      console.log(
        "[RightVideo] Calling API...",
        newLikedState ? "addLove" : "removeLove"
      );
      if (newLikedState) {
        const response = await LikeService.addLove(id);
        console.log("[RightVideo] Love added, new count:", response.loveCount);

        // Cập nhật lại count chính xác từ server
        setCurrentLikes(response.loveCount);
        dispatch(
          updateFeedItem({
            id,
            updates: {
              loved: response.loved,
              likes: response.loveCount,
            },
          })
        );
      } else {
        const response = await LikeService.removeLove(id);
        console.log(
          "[RightVideo] Love removed, new count:",
          response.loveCount
        );

        // Cập nhật lại count chính xác từ server
        setCurrentLikes(response.loveCount);
        dispatch(
          updateFeedItem({
            id,
            updates: {
              loved: response.loved,
              likes: response.loveCount,
            },
          })
        );
      }
      console.log("[RightVideo] API call successful ✅");
    } catch (error: any) {
      // Bước 3: Rollback nếu API lỗi
      console.error("[RightVideo] ❌ Failed to update love status:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      setLiked(!newLikedState);
      setCurrentLikes(previousLikes);
      dispatch(
        updateFeedItem({
          id,
          updates: {
            loved: !newLikedState,
            likes: previousLikes,
          },
        })
      );
      Alert.alert(
        "Lỗi",
        "Không thể cập nhật trạng thái yêu thích. Vui lòng thử lại."
      );
    }
  };

  const handleOpenComments = () => {
    if (onCommentPress) {
      onCommentPress();
    }
  };

  const handleUpdateCommentCount = (newCount: number) => {
    console.log("[RightVideo] Updating comment count to:", newCount);
    setCurrentComments(newCount);
    // Update Redux store if needed
    dispatch(updateFeedItem({ id, updates: { comments: newCount } }));
  };

  const handleAvatarPress = () => {
    if (uploaderUserId) {
      console.log(
        "[RightVideo] Navigating to UserProfile with ID:",
        uploaderUserId
      );
      navigation.navigate("UserProfile", { userDetailId: uploaderUserId });
    } else {
      console.warn("[RightVideo] No uploaderUserId provided");
    }
  };

  const getAvatarInitial = (name?: string) =>
    name?.charAt(0).toUpperCase() || "?";

  return (
    <View style={[styles.rightVideoContainer, { bottom: bottomPosition }]}>
      {/* Avatar với dấu cộng - hiển thị avatar của người upload */}
      <TouchableOpacity
        style={styles.avatarContainer}
        onPress={handleAvatarPress}
        activeOpacity={0.7}
      >
        {avatarUrl ? (
          <Image style={styles.avatar} source={{ uri: avatarUrl }} />
        ) : (
          <View style={[styles.avatar, styles.avatarInitial]}>
            <Text style={styles.avatarInitialText}>
              {getAvatarInitial(username)}
            </Text>
          </View>
        )}
        <MaterialCommunityIcons
          name="plus-circle"
          size={26}
          color="#ff2d55"
          style={styles.plusIcon}
        />
      </TouchableOpacity>

      {/* Like with animation */}
      <Pressable style={styles.likeIconContainer} onPress={handleLike}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <AntDesign
            name="heart"
            size={ICON_SIZE}
            color={liked ? "#ff2d55" : "#fff"}
          />
        </Animated.View>
        <Text style={styles.iconText}>{currentLikes}</Text>
      </Pressable>

      {/* Comment */}
      <IconWithCount
        icon={
          <Ionicons name="chatbubble-ellipses" size={ICON_SIZE} color="#fff" />
        }
        count={currentComments}
        onPress={handleOpenComments}
      />

      {/* Outstanding (bookmark Ionicons) */}
      <IconWithCount
        icon={
          <MaterialCommunityIcons
            name="bookmark-multiple"
            size={ICON_SIZE}
            color="#fff"
          />
        }
        count={outstanding}
      />

      {/* Share */}
      <IconWithCount
        icon={
          <MaterialCommunityIcons
            name="share-variant"
            style={{ marginRight: 5, marginTop: -5 }}
            size={ICON_SIZE}
            color="#fff"
          />
        }
        count={shares}
        onPress={() => setShareModalVisible(true)}
      />

      {/* Music Icon with rotation animation */}
      <View style={styles.iconContainer}>
        <Animated.Image
          source={img}
          style={[styles.musicIcon, { transform: [{ rotate: spin }] }]}
        />
      </View>

      {/* Share Video Modal */}
      <ShareVideoModal
        visible={shareModalVisible}
        onClose={() => setShareModalVisible(false)}
        feedItemId={id}
      />
    </View>
  );
}
