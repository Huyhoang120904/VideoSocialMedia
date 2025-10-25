import React, { useState } from "react";
import { View, Image, Text, Pressable } from "react-native";
import { useDispatch } from "react-redux";
import { updateVideo } from "../../store/videoSlice";
import {
  AntDesign,
  FontAwesome6,
  Ionicons,
  MaterialCommunityIcons,
} from "@expo/vector-icons";
import VideoCommentModal from "../Comment/VideoCommentModal";
import img from "../../../assets/avatar.png";
import styles from "./styles";

const ICON_SIZE = 28; // Slightly smaller for better proportion

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

  const handleLike = () => {
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

      {/* Like */}
      <IconWithCount
        icon={
          <AntDesign
            name="heart"
            size={ICON_SIZE}
            color={liked ? "#ff2d55" : "#fff"}
          />
        }
        count={likes}
        onPress={handleLike}
        containerStyle={styles.likeIconContainer}
      />

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

      {/* Music Icon - positioned at far right */}
      <View style={styles.iconContainer}>
        <Image source={img} style={styles.musicIcon} />
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
