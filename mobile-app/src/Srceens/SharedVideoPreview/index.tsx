import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import FeedPost from "../../Components/Post/FeedPost";
import { FeedItem } from "../../Store/feedSlice";
import { getFeedItemById } from "../../Services/FeedItemService";
import FeedItemResponse from "../../Types/response/FeedItemResponse";
import { mapFeedItemResponseToFeedItem } from "../../Utils/feedItemMapper";

type SharedVideoPreviewParams = {
  feedItemId?: string;
  feedItem?: FeedItemResponse;
};

export default function SharedVideoPreviewScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const isFocused = useIsFocused();
  const { feedItemId, feedItem: preloadedFeedItem } =
    (route.params as SharedVideoPreviewParams) || {};

  const initialFeedItem = useMemo(
    () =>
      preloadedFeedItem
        ? mapFeedItemResponseToFeedItem(preloadedFeedItem)
        : null,
    [preloadedFeedItem]
  );

  const [feedItem, setFeedItem] = useState<FeedItem | null>(initialFeedItem);
  const [isLoading, setIsLoading] = useState(!initialFeedItem);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadFeedItem = async () => {
      if (!feedItemId) {
        setError("Video reference not found");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await getFeedItemById(feedItemId);
        const mapped = response.result
          ? mapFeedItemResponseToFeedItem(response.result)
          : null;

        if (!isMounted) {
          return;
        }

        if (mapped) {
          setFeedItem(mapped);
        } else {
          setError("This video is no longer available.");
        }
      } catch (err: any) {
        if (!isMounted) {
          return;
        }
        setError(err.message || "Unable to load video");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Always attempt to refresh to ensure latest data
    loadFeedItem();

    return () => {
      isMounted = false;
    };
  }, [feedItemId]);

  const videoHeight = Dimensions.get("window").height;

  const renderContent = () => {
    if (isLoading && !feedItem) {
      return (
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#EC4899" />
          <Text style={styles.statusText}>Loading shared video...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.centerContent}>
          <Ionicons name="alert-circle-outline" size={32} color="#ef4444" />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      );
    }

    if (!feedItem) {
      return (
        <View style={styles.centerContent}>
          <Text style={styles.statusText}>Video not found.</Text>
        </View>
      );
    }

    return (
      <View style={styles.feedPostContainer}>
        <FeedPost
          feedItem={feedItem}
          isActive={!!isFocused}
          itemHeight={videoHeight}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.content}>{renderContent()}</View>

        <View style={styles.headerOverlay}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Go back"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Shared Video</Text>
          <View style={styles.headerSpacer} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#000",
  },
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  statusText: {
    marginTop: 12,
    color: "#f3f4f6",
    textAlign: "center",
  },
  errorText: {
    marginTop: 12,
    color: "#f87171",
    textAlign: "center",
  },
  feedPostContainer: {
    flex: 1,
  },
  headerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "transparent",
  },
  backButton: {
    padding: 6,
    borderRadius: 999,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerSpacer: {
    width: 28,
  },
});
