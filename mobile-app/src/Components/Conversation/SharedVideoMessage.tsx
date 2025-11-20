import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { getFeedItemById } from "../../Services/FeedItemService";
import FeedItemResponse from "../../Types/response/FeedItemResponse";
import { getThumbnailUrl } from "../../Utils/ImageUrlHelper";

interface SharedVideoMessageProps {
  feedItemId: string;
  messageText?: string;
  isMyMessage: boolean;
}

export default function SharedVideoMessage({
  feedItemId,
  messageText,
  isMyMessage,
}: SharedVideoMessageProps) {
  const navigation = useNavigation<any>();
  const [feedItem, setFeedItem] = useState<FeedItemResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedItem = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await getFeedItemById(feedItemId);
        if (response.result) {
          setFeedItem(response.result);
        }
      } catch (err: any) {
        console.error("Error fetching feed item:", err);
        setError("Failed to load video");
      } finally {
        setIsLoading(false);
      }
    };

    if (feedItemId) {
      fetchFeedItem();
    }
  }, [feedItemId]);

  const handlePress = () => {
    if (!feedItem) {
      return;
    }

    navigation.navigate("SharedVideoPreview", {
      feedItemId,
      feedItem,
    });
  };

  const thumbnailUrl = useMemo(() => {
    if (!feedItem) return null;

    if (feedItem.feedItemType === "VIDEO" && feedItem.video) {
      if (feedItem.video.thumbnailUrl) {
        return getThumbnailUrl(feedItem.video.thumbnailUrl);
      }

      return feedItem.video.secureUrl || feedItem.video.url;
    }

    if (
      feedItem.feedItemType === "IMAGE_SLIDE" &&
      feedItem.imageSlide?.images?.length
    ) {
      const firstImage = feedItem.imageSlide.images[0];
      return getThumbnailUrl(firstImage.thumbnailUrl || firstImage.url);
    }

    return null;
  }, [feedItem]);

  const title = useMemo(() => {
    if (!feedItem) return "Shared Video";
    return feedItem.title || feedItem.description || "Shared Video";
  }, [feedItem]);

  const subtitle = useMemo(() => {
    if (!feedItem) return "Tap to watch";

    const uploader =
      feedItem.uploader?.displayName ||
      feedItem.uploader?.shownName ||
      feedItem.uploader?.user?.username;

    if (uploader) {
      return `From ${uploader}`;
    }

    return "Shared from feed";
  }, [feedItem]);

  const renderPreview = () => {
    let previewContent: React.ReactNode;

    if (isLoading) {
      previewContent = (
        <View style={styles.previewState}>
          <ActivityIndicator size="small" color="#fff" />
          <Text style={styles.previewStateText}>Loading preview…</Text>
        </View>
      );
    } else if (error || !feedItem) {
      previewContent = (
        <View style={styles.previewState}>
          <Ionicons name="alert-circle" size={22} color="#fecaca" />
          <Text style={[styles.previewStateText, { color: "#fecaca" }]}>
            {error || "Video unavailable"}
          </Text>
        </View>
      );
    } else if (thumbnailUrl) {
      previewContent = (
        <Image
          source={{ uri: thumbnailUrl }}
          style={styles.previewImage}
          resizeMode="cover"
        />
      );
    } else {
      previewContent = (
        <View style={styles.previewState}>
          <Ionicons name="videocam" size={26} color="#fff" />
          <Text style={styles.previewStateText}>Video preview</Text>
        </View>
      );
    }

    return (
      <View style={styles.previewWrapper}>
        {previewContent}
        <View style={styles.previewOverlay} />
        <View style={styles.previewFooter}>
          <Text style={styles.previewFooterText}>Tap to open</Text>
          <Ionicons name="play" size={16} color="#fff" />
        </View>
      </View>
    );
  };

  const renderDetails = () => {
    if (isLoading) {
      return (
        <View style={styles.details}>
          <Text style={styles.loadingText}>Fetching shared video…</Text>
        </View>
      );
    }

    if (error || !feedItem) {
      return (
        <View style={styles.details}>
          <Text
            style={[
              styles.unavailableText,
              { color: isMyMessage ? "#fecaca" : "#b91c1c" },
            ]}
          >
            {error || "This video can’t be loaded right now."}
          </Text>
          <Text
            style={[
              styles.message,
              { color: isMyMessage ? "#d1d5db" : "#475569" },
            ]}
          >
            Try asking the sender to share it again.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.details}>
        <View style={styles.badgeRow}>
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isMyMessage
                  ? "rgba(96,165,250,0.15)"
                  : "rgba(14,165,233,0.12)",
              },
            ]}
          >
            <Ionicons
              name="film-outline"
              size={14}
              color={isMyMessage ? "#93c5fd" : "#0ea5e9"}
            />
            <Text
              style={[
                styles.badgeText,
                { color: isMyMessage ? "#93c5fd" : "#0ea5e9" },
              ]}
            >
              Shared Video
            </Text>
          </View>
          <Text
            style={[
              styles.metaHint,
              { color: isMyMessage ? "#cbd5f5" : "#94a3b8" },
            ]}
          >
            {subtitle}
          </Text>
        </View>

        <Text
          style={[styles.title, { color: isMyMessage ? "#fff" : "#0f172a" }]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {messageText && messageText !== title && (
          <Text
            style={[
              styles.caption,
              { color: isMyMessage ? "#e2e8f0" : "#475569" },
            ]}
            numberOfLines={2}
          >
            “{messageText}”
          </Text>
        )}

        <View style={styles.ctaRow}>
          <Ionicons name="play-circle" size={18} color="#ec4899" />
          <Text style={styles.ctaText}>Watch video</Text>
        </View>
      </View>
    );
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.93}
      style={[
        styles.container,
        isMyMessage ? styles.myMessageContainer : styles.otherMessageContainer,
      ]}
    >
      {renderPreview()}
      {renderDetails()}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 22,
    marginVertical: 6,
    maxWidth: "92%",
    backgroundColor: "#fff",
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.08)",
    shadowColor: "#0f172a",
    shadowOpacity: 0.18,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 12,
    elevation: 4,
  },
  myMessageContainer: {
    alignSelf: "flex-end",
    backgroundColor: "#0f172a",
    borderColor: "rgba(148,163,184,0.2)",
  },
  otherMessageContainer: {
    alignSelf: "flex-start",
  },
  previewWrapper: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#0f172a",
    position: "relative",
  },
  previewImage: {
    width: "100%",
    height: "100%",
  },
  previewState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
  },
  previewStateText: {
    color: "#f8fafc",
    fontSize: 12,
  },
  previewOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
  },
  previewFooter: {
    position: "absolute",
    bottom: 12,
    left: 16,
    right: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.65)",
  },
  previewFooterText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  details: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  subtitle: {
    fontSize: 13,
    fontWeight: "500",
  },
  caption: {
    fontSize: 12,
    fontStyle: "italic",
  },
  message: {
    fontSize: 12,
  },
  ctaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  ctaText: {
    color: "#ec4899",
    fontWeight: "600",
    fontSize: 12,
  },
  metaHint: {
    fontSize: 11,
  },
  loadingText: {
    fontSize: 13,
  },
  unavailableText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
