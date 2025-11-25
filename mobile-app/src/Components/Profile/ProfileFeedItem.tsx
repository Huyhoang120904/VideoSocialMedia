import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Dimensions,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { VideoItem } from "../../Services/FeedItemService";
import { formatVietnameseViewCount } from "../../Utils/NumberHelper";

const { width } = Dimensions.get("window");
export const PROFILE_ITEM_GAP = 1;
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (width - PROFILE_ITEM_GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;
const ITEM_HEIGHT = ITEM_WIDTH * 1.35;

interface ProfileFeedItemProps {
  item: VideoItem;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}

export const ProfileFeedItem: React.FC<ProfileFeedItemProps> = ({
  item,
  onPress,
  style,
}) => {
  const thumbnailUrl = item.thumbnailUrl || item.uri;
  const viewCount = item.outstanding || 0;
  const likeCount = item.likes || 0;
  const formatCount = (value: number) =>
    formatVietnameseViewCount(value).replace(/^▷\s*/, "");
  const likeDisplay = formatCount(likeCount);
  const viewDisplay = formatCount(viewCount);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        { width: ITEM_WIDTH, height: ITEM_HEIGHT },
        style,
      ]}
      activeOpacity={0.9}
      onPress={onPress}
    >
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} />
      ) : (
        <View style={[styles.thumbnail, styles.placeholder]} />
      )}

      <LinearGradient
        colors={["rgba(0,0,0,0.15)", "rgba(0,0,0,0.65)", "rgba(0,0,0,0.95)"]}
        locations={[0, 0.45, 1]}
        style={styles.overlay}
      />

      <View style={styles.bottomStats}>
        <View style={styles.statGroup}>
          <Ionicons name="heart" size={11} color="#fff" />
          <Text style={styles.statText}>{likeDisplay}</Text>
        </View>

        <View style={styles.statGroup}>
          <Ionicons name="play" size={11} color="#fff" />
          <Text style={styles.statText}>{viewDisplay}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 0,
    overflow: "hidden",
    backgroundColor: "#050505",
  },
  thumbnail: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  placeholder: {
    backgroundColor: "#2a2a2a",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  bottomStats: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
  },
});
