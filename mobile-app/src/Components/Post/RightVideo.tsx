import React, { useState, useRef, useEffect } from "react";
import { View, Image, Text, Pressable, Animated } from "react-native";
import { useDispatch } from "react-redux";
import { updateVideo } from "../../Store/videoSlice";
import {
  AntDesign,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import VideoCommentModal from "../Comment/VideoCommentModal";
import img from "../../../assets/avatar.png";
import styles from "./styles";

const ICON_SIZE = 32; // Increased for better visibility

interface RightVideoProps {
  id: string;
  likes: number;
  comments: number;
  shares: number;
  outstanding: number;
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
}: RightVideoProps) {
  const dispatch = useDispatch();
  const [liked, setLiked] = useState(false);
  const [commentModalVisible, setCommentModalVisible] = useState(false);
  
  // Animations
  const likeScale = useRef(new Animated.Value(1)).current;
  const musicRotation = useRef(new Animated.Value(0)).current;

  // Sample comments data - replace with real data from API
  const [commentsList, setCommentsList] = useState([
    {
      id: "1",
      username: "user123",
      avatar: "https://picsum.photos/100/100?random=1",
      comment: "Video rất hay! 👏",
      timeAgo: "2 phút trước",
      likes: 12,
    },
    {
      id: "2",
      username: "tiktokfan",
      avatar: "https://picsum.photos/100/100?random=2",
      comment: "Làm thêm video về chủ đề này đi bạn ơi",
      timeAgo: "5 phút trước",
      likes: 8,
    },

  ]);

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
    outputRange: ['0deg', '360deg'],
  });

  const handleLike = () => {
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

    setLiked(!liked);
    dispatch(
      updateVideo({ id, updates: { likes: liked ? likes - 1 : likes + 1 } })
    );
  };

  const handleOpenComments = () => {
    setCommentModalVisible(true);
  };

  const handleCloseComments = () => {
    setCommentModalVisible(false);
  };

  const handleAddComment = (newComment: string) => {
    const newCommentObj = {
      id: Date.now().toString(),
      username: "current_user", // Replace with current user's username
      avatar: "https://picsum.photos/100/100?random=0",
      comment: newComment,
      timeAgo: "Vừa xong",
      likes: 0,
    };
    setCommentsList([newCommentObj, ...commentsList]);
    dispatch(updateVideo({ id, updates: { comments: comments + 1 } }));
  };

  return (
    <View style={styles.rightVideoContainer}>
      {/* Avatar với dấu cộng */}
      <View style={styles.avatarContainer}>
        <Image style={styles.avatar} source={img} />
        <MaterialCommunityIcons
          name="plus-circle"
          size={26}
          color="#ff2d55"
          style={styles.plusIcon}
        />
      </View>

      {/* Like with animation */}
      <Pressable style={styles.likeIconContainer} onPress={handleLike}>
        <Animated.View style={{ transform: [{ scale: likeScale }] }}>
          <AntDesign
            name="heart"
            size={ICON_SIZE}
            color={liked ? "#ff2d55" : "#fff"}
          />
        </Animated.View>
        <Text style={styles.iconText}>{likes}</Text>
      </Pressable>

      {/* Comment */}
      <IconWithCount
        icon={
          <Ionicons name="chatbubble-ellipses" size={ICON_SIZE} color="#fff" />
        }
        count={comments}
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
      />

      {/* Music Icon with rotation animation */}
      <View style={styles.iconContainer}>
        <Animated.Image 
          source={img} 
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
        comments={commentsList}
        onAddComment={handleAddComment}
      />
    </View>
  );
}
