import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const ITEM_WIDTH = (width - 18) / 2; // 2 columns with spacing

interface ExploreVideo {
  id: string;
  thumbnail: string;
  title: string;
  author: string;
  likes: string;
  isMultiImage?: boolean;
  isVideo?: boolean; // true for video, false for post
}

export default function ExploreScreen() {
  const exploreItems: ExploreVideo[] = [
    {
      id: "1",
      thumbnail: "https://picsum.photos/400/600?random=1",
      title: "một là em, hai là một, ba thì bye..",
      author: "Alana",
      likes: "1.431",
      isVideo: true,
    },
    {
      id: "2",
      thumbnail: "https://picsum.photos/400/600?random=2",
      title: "#CapCut thỏi em cúp máy đây",
      author: "Hoàng Linh Anh",
      likes: "2.596",
      isVideo: true,
    },
    {
      id: "3",
      thumbnail: "https://picsum.photos/400/600?random=3",
      title: "Xung quanh đây hỏn bế đều là thính... Bình tĩnh như em...",
      author: "Ngoc Lan",
      likes: "417",
      isMultiImage: true,
      isVideo: false, // This is a post with multiple images
    },
    {
      id: "4",
      thumbnail: "https://picsum.photos/400/600?random=4",
      title: "Không biết nói gì nuôn 🤣",
      author: "Huong Quynh 💕",
      likes: "21,8 N",
      isVideo: false, // This is a regular post
    },
    {
      id: "5",
      thumbnail: "https://picsum.photos/400/600?random=5",
      title: "Trending dance challenge",
      author: "Dancing Queen",
      likes: "15.2K",
      isVideo: true,
    },
    {
      id: "6",
      thumbnail: "https://picsum.photos/400/600?random=6",
      title: "Makeup tutorial vibes",
      author: "Beauty Guru",
      likes: "8.9K",
      isVideo: false, // This is a makeup post
    },
    {
      id: "7",
      thumbnail: "https://picsum.photos/400/600?random=7",
      title: "Food challenge gone wrong",
      author: "Foodie Life",
      likes: "25.3K",
      isVideo: true,
    },
    {
      id: "8",
      thumbnail: "https://picsum.photos/400/600?random=8",
      title: "Pet compilation so cute",
      author: "Animal Lover",
      likes: "32.1K",
      isVideo: false, // This is a photo post
    },
  ];

  const renderItem = ({
    item,
    index,
  }: {
    item: ExploreVideo;
    index: number;
  }) => {
    const itemHeight = Math.random() * 100 + 250; // Random height between 250-350

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
                  uri: `https://picsum.photos/30/30?random=${item.id}`,
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
      {/* Content Grid - No header, use topVideo header */}
      <FlatList
        data={exploreItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.flatListContent}
        columnWrapperStyle={styles.row}
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
