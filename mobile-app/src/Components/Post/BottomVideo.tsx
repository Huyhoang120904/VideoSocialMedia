import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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

  // Lấy chiều cao thực tế của tab bar và safe area
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  // Tính bottom position: mong muốn là sát phía trên phần icon của tab bar
  // Note: `tabBarHeight` thường bao gồm cả safe-area bottom (insets.bottom).
  // Để đưa container sát thanh điều hướng (phía trên icon), ta trừ safe-area
  // nếu có. Sau đó thêm một khoảng an toàn EXTRA_SPACING để tránh vùng gesture.
  // Use a very small extra spacing so the container sits closer to the nav icons
  const EXTRA_SPACING = -36; // tuned down after runtime logs
  const visualTabIconsHeight = Math.max(tabBarHeight - insets.bottom, 0);
  const bottomPosition = visualTabIconsHeight + EXTRA_SPACING;

  // Log runtime values to help debug layout on different devices
  React.useEffect(() => {
    try {
      console.log('[BottomVideo] tabBarHeight:', tabBarHeight, 'insets.bottom:', insets.bottom, 'visualTabIconsHeight:', visualTabIconsHeight, 'bottomPosition:', bottomPosition);
    } catch (e) {
      // ignore
    }
  }, [tabBarHeight, insets.bottom, visualTabIconsHeight, bottomPosition]);



  // Check if title is a video filename
  const isVideoFilename = title && title.match(/\.(mp4|mov|avi|mkv|webm)$/i);
  const displayTitle = isVideoFilename ? undefined : title;

  // Combine description with hashtags inline
  const descriptionWithHashtags = React.useMemo(() => {
    if (!description) return '';
    
    // Extract hashtags from description if they exist
    const hashtagRegex = /#\w+/g;
    const foundHashtags = description.match(hashtagRegex) || [];
    const descriptionWithoutHashtags = description.replace(hashtagRegex, '').trim();
    
    // Combine description text with hashtags (giảm khoảng cách)
    const hashtagText = foundHashtags.length > 0 ? ' ' + foundHashtags.join(' ') : '';
    const additionalHashtags = hashtags && hashtags.length > 0 
      ? ' ' + hashtags.map(tag => `#${tag}`).join(' ')
      : '';
    
    return descriptionWithoutHashtags + hashtagText + additionalHashtags;
  }, [description, hashtags]);

  // Giới hạn 20 ký tự cho description khi thu gọn
  const MAX_CHARS = 20;
  const needsTruncate = descriptionWithHashtags && descriptionWithHashtags.length > MAX_CHARS;
  const truncatedDescription = needsTruncate && !showFullDescription
    ? descriptionWithHashtags.substring(0, MAX_CHARS)
    : descriptionWithHashtags;

  // Format search text: "Tìm kiếm - {description}"
  const baseSearchText = description || title || username;
  const SEARCH_MAX_CHARS = 35;
  const trimmedSearch =
    baseSearchText && baseSearchText.length > SEARCH_MAX_CHARS
      ? `${baseSearchText.slice(0, SEARCH_MAX_CHARS).trim()}…`
      : baseSearchText;
  const searchDisplayText = trimmedSearch
    ? `Tìm kiếm - ${trimmedSearch}`
    : `Tìm kiếm - ${username}`;

  return (
    <View style={[styles.bottomVideoContainer, { bottom: bottomPosition }]} pointerEvents="box-none">
      <View style={styles.contentLeft} pointerEvents="box-none">
        {/* Username without @ symbol */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 4,
          }}
          pointerEvents="box-none"
        >
          <Text style={styles.username}>{username}</Text>
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

        {/* Description with hashtags inline - use TouchableOpacity to prevent video pause */}
        {descriptionWithHashtags ? (
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
              paddingVertical: 2,
              marginBottom: 8,
              zIndex: 999,
              elevation: 999,
            }}
            hitSlop={{ top: 12, bottom: 20, left: 12, right: 12 }}
          >
            <Text style={styles.description}>
              {showFullDescription || !needsTruncate 
                ? descriptionWithHashtags 
                : truncatedDescription}
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
      </View>

      {/* Search bar - nằm riêng, ngay phía trên bottom nav */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={18} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.searchText} numberOfLines={1}>
            {searchDisplayText}
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#fff" style={{ marginLeft: 8 }} />
        </View>
      </View>
    </View>
  );
}
