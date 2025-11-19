import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import styles from "./styles";

interface BottomVideoProps {
  title?: string;
  description?: string;
  username?: string;
  hashtags?: string[];
}

export default function BottomVideo({
  title,
  description,
  username = "user1",
  hashtags = [],
}: BottomVideoProps) {
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  // Check if title is a video filename
  const isVideoFilename = title && title.match(/\.(mp4|mov|avi|mkv|webm)$/i);
  const displayTitle = isVideoFilename ? undefined : title;

  // Giới hạn 20 ký tự cho description khi thu gọn
  const MAX_CHARS = 20;
  const needsTruncate = description && description.length > MAX_CHARS;
  const truncatedDescription = needsTruncate && !showFullDescription
    ? description.substring(0, MAX_CHARS)
    : description;

  return (
    <View style={styles.bottomVideoContainer} pointerEvents="box-none">
      <View style={styles.contentLeft} pointerEvents="box-none">
        {/* Username with @ symbol */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 6,
          }}
          pointerEvents="box-none"
        >
          <Text style={styles.username}>@{username}</Text>
        </View>

        {/* Title/Caption */}
        {displayTitle && (
          <Text
            style={styles.title}
            numberOfLines={2}
          >
            {displayTitle}
          </Text>
        )}

        {/* Description with "xem thêm" - use TouchableOpacity to prevent video pause */}
        {description ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              console.log('🔥 TouchableOpacity pressed!');
              if (needsTruncate) {
                console.log('Toggling showFullDescription from', showFullDescription, 'to', !showFullDescription);
                setShowFullDescription(!showFullDescription);
              } else {
                console.log('⚠️ needsTruncate is false, no toggle');
              }
            }}
            style={{
              paddingVertical: 4,
              marginBottom: 6,
              zIndex: 999,
              elevation: 999,
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.description}>
              {truncatedDescription}
              {needsTruncate && (
                <Text style={styles.seeMore}>
                  {showFullDescription ? ' Thu gọn' : '...xem thêm'}
                </Text>
              )}
            </Text>
          </TouchableOpacity>
        ) : !displayTitle && (
          <Text style={styles.description}>Không có mô tả</Text>
        )}

        {/* Hashtags */}
        {hashtags && hashtags.length > 0 && (
          <View style={{
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 6,
            marginBottom: 4
          }}>
            {hashtags.map((tag, index) => (
              <Text key={index} style={styles.hashtag}>
                #{tag}
              </Text>
            ))}
          </View>
        )}

        {/* Music/Sound info */}
        <View style={styles.musicContainer}>
          <Ionicons name="musical-notes" size={14} color="#fff" />
          <Text style={styles.musicText} numberOfLines={1}>
            Original sound - {username}
          </Text>
        </View>
      </View>
    </View>
  );
}
