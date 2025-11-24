import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { FeedItem } from "../../Store/feedSlice";
import { FeedItemType } from "../../Types/response/FeedItemResponse";
import { formatVietnameseViewCount } from "../../Utils/NumberHelper";

const { width } = Dimensions.get("window");
const ITEM_MARGIN = 2;
const NUM_COLUMNS = 3;
const ITEM_WIDTH = (width - ITEM_MARGIN * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

interface GridFeedItemProps {
  item: FeedItem;
  onPress: (item: FeedItem) => void;
  isViewed?: boolean;
}

// Get thumbnail URL
const getThumbnailUrl = (item: FeedItem): string | null => {
  if (item.feedItemType === FeedItemType.VIDEO && item.video?.thumbnailUrl) {
    return item.video.thumbnailUrl;
  }
  if (item.feedItemType === FeedItemType.IMAGE_SLIDE && item.imageSlide?.images?.[0]?.url) {
    return item.imageSlide.images[0].url;
  }
  return null;
};

export default function GridFeedItem({ item, onPress, isViewed = false }: GridFeedItemProps) {
  const thumbnailUrl = getThumbnailUrl(item);
  // Use outstanding as view count if available, otherwise default to 0
  const viewCount = (item as any).views || item.outstanding || 0;
  const title = item.title || "";
  const source = item.uploader?.displayName || item.uploader?.shownName || item.uploader?.user?.username || "Unknown";

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress(item)}
      activeOpacity={0.8}
    >
      {thumbnailUrl ? (
        <Image source={{ uri: thumbnailUrl }} style={styles.thumbnail} resizeMode="cover" />
      ) : (
        <View style={[styles.thumbnail, styles.placeholder]} />
      )}
      
      {/* Overlay gradient */}
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.5)", "rgba(0,0,0,0.9)"]}
        locations={[0, 0.4, 1]}
        style={styles.overlay}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      
      {/* Content */}
      <View style={styles.content}>
        {/* Viewed indicator */}
        {isViewed && (
          <View style={styles.viewedIndicator}>
            <Text style={styles.viewedText}>► Vừa xem</Text>
          </View>
        )}
        
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        
        {/* Source and view count */}
        <View style={styles.footer}>
          <Text style={styles.source} numberOfLines={1}>
            {source}
          </Text>
          <Text style={styles.viewCount}>
            {formatVietnameseViewCount(viewCount)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: ITEM_WIDTH,
    height: ITEM_WIDTH * 1.4, // Aspect ratio ~1.4:1
    margin: ITEM_MARGIN,
    borderRadius: 6,
    overflow: "hidden",
    backgroundColor: "#1a1a1a",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  placeholder: {
    backgroundColor: "#2a2a2a",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "65%",
  },
  content: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    paddingTop: 6,
  },
  viewedIndicator: {
    alignSelf: "flex-start",
    marginBottom: 6,
  },
  viewedText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
    fontFamily: "TikTokSans-SemiBold",
  },
  title: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    fontFamily: "TikTokSans-SemiBold",
    marginBottom: 6,
    lineHeight: 15,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 4,
  },
  source: {
    color: "#fff",
    fontSize: 10,
    fontFamily: "TikTokSans-Regular",
    flex: 1,
    marginRight: 4,
  },
  viewCount: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "600",
    fontFamily: "TikTokSans-SemiBold",
  },
});

