import React, { useMemo } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { FeedItem } from "../../Store/feedSlice";
import { FeedItemType } from "../../Types/response/FeedItemResponse";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 18) / 2; // 2 columns with spacing
const BASE_ITEM_HEIGHT = 240;

interface ExploreVideoCard {
  id: string;
  thumbnail: string;
  title: string;
  author: string;
  likes: string;
  isMultiImage: boolean;
  isVideo: boolean;
}

interface ExploreScreenProps {
  data: FeedItem[];
  loading: boolean;
  error?: string | null;
  refreshing?: boolean;
  onRefresh: () => void | Promise<void>;
  onRetry: () => void;
}

const formatCount = (value: number): string => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  }
  return value.toString();
};

const getThumbnailForFeedItem = (item: FeedItem): string | null => {
  if (item.feedItemType === FeedItemType.VIDEO && item.video) {
    return (
      item.video.thumbnailUrl || item.video.secureUrl || item.video.url || null
    );
  }

  if (item.feedItemType === FeedItemType.IMAGE_SLIDE && item.imageSlide) {
    const coverImage = item.imageSlide.images?.[0];
    return coverImage?.secureUrl || coverImage?.url || null;
  }

  return null;
};

export default function ExploreScreen({
  data,
  loading,
  error,
  refreshing,
  onRefresh,
  onRetry,
}: ExploreScreenProps) {
  const exploreItems = useMemo(() => {
    return data
      .map<ExploreVideoCard | null>((item) => {
        const thumbnail = getThumbnailForFeedItem(item);
        if (!thumbnail) {
          return null;
        }

        return {
          id: item.id,
          thumbnail,
          title: item.title || item.description || "Nội dung",
          author:
            item.uploader?.displayName ||
            item.uploader?.shownName ||
            item.uploader?.user?.username ||
            "Người dùng",
          likes: formatCount(item.likes || 0),
          isMultiImage:
            item.feedItemType === FeedItemType.IMAGE_SLIDE &&
            (item.imageSlide?.images?.length || 0) > 1,
          isVideo: item.feedItemType === FeedItemType.VIDEO,
        };
      })
      .filter((card): card is ExploreVideoCard => card !== null);
  }, [data]);

  const renderEmptyState = () => {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="small" color="#000" />
          <Text style={styles.loadingText}>Đang tải nội dung...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retryText} onPress={onRetry}>
            Thử lại
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>Không có nội dung để khám phá</Text>
      </View>
    );
  };

  const renderItem = ({
    item,
    index,
  }: {
    item: ExploreVideoCard;
    index: number;
  }) => {
    const itemHeight = BASE_ITEM_HEIGHT + (index % 3) * 40;

    return (
      <TouchableOpacity
        style={[
          styles.gridItem,
          {
            width: ITEM_WIDTH,
            height: itemHeight,
          },
        ]}
      >
        <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />

        {/* Video play button or post indicator */}
        {item.isVideo ? (
          <View style={styles.playButtonOverlay}>
            <Ionicons name="play" size={20} color="white" />
          </View>
        ) : (
          <View style={styles.postIndicator}>
            <Ionicons name="image-outline" size={16} color="white" />
          </View>
        )}

        {/* Multi-image indicator */}
        {item.isMultiImage && (
          <View style={styles.multiImageIndicator}>
            <Ionicons name="copy-outline" size={16} color="white" />
          </View>
        )}

        {/* Content info */}
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={styles.authorRow}>
            <View style={styles.authorInfo}>
              <Image
                source={{
                  uri: `https://i.pravatar.cc/150?u=${item.id}`,
                }}
                style={styles.authorAvatar}
              />
              <Text style={styles.authorName} numberOfLines={1}>
                {item.author}
              </Text>
            </View>
            <View style={styles.likesContainer}>
              <Ionicons name="heart" size={12} color="#666" />
              <Text style={styles.likesText}>{item.likes || 0}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={exploreItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.flatListContent,
          exploreItems.length === 0 && styles.emptyContentContainer,
        ]}
        columnWrapperStyle={styles.row}
        refreshing={refreshing}
        onRefresh={onRefresh}
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    marginTop: 90,
  },

  flatListContent: {
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  row: {
    justifyContent: "space-between",
    paddingHorizontal: 0,
  },
  gridItem: {
    backgroundColor: "#f8f8f8",
    borderRadius: 8,
    marginBottom: 6,
    marginHorizontal: 3,
    overflow: "hidden",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "70%",
    resizeMode: "cover",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  loadingText: {
    marginTop: 8,
    color: "#444",
    fontSize: 14,
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#c0392b",
    textAlign: "center",
    marginBottom: 8,
  },
  retryText: {
    fontSize: 15,
    color: "#111",
    fontWeight: "600",
  },
  playButtonOverlay: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  postIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  multiImageIndicator: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  itemInfo: {
    padding: 8,
    height: "30%",
    justifyContent: "space-between",
  },
  itemTitle: {
    fontSize: 12,
    color: "#000",
    fontWeight: "400",
    lineHeight: 16,
    marginBottom: 4,
  },
  authorRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  authorAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: 4,
  },
  authorName: {
    fontSize: 10,
    color: "#666",
    flex: 1,
  },
  likesContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  likesText: {
    fontSize: 10,
    color: "#666",
    marginLeft: 2,
  },
});
