import React from "react";
import { View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import { FeedItemType } from "../../Types/response/FeedItemResponse";
import { VideoItem } from "../../Services/FeedItemService";
import { formatNumber } from "../../Utils/NumberHelper";

const { width } = Dimensions.get("window");

interface ProfileFeedItemProps {
  item: VideoItem;
  onPress: () => void;
}

export const ProfileFeedItem: React.FC<ProfileFeedItemProps> = ({
  item,
  onPress,
}) => {
  const itemWidth = (width - 24) / 3;
  const itemHeight = (itemWidth * 16) / 9;

  return (
    <TouchableOpacity
      className="m-1 bg-gray-900 rounded-lg overflow-hidden"
      style={{
        width: itemWidth,
        height: itemHeight,
      }}
      activeOpacity={0.8}
      onPress={onPress}
    >
      {/* Display thumbnail for both VIDEO and IMAGE_SLIDE */}
      {item.thumbnailUrl ? (
        <Image
          source={{ uri: item.thumbnailUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : item.feedItemType === FeedItemType.VIDEO && item.uri ? (
        // Fallback to video if no thumbnail for VIDEO type
        <Video
          source={{ uri: item.uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode={ResizeMode.COVER}
          shouldPlay={false}
          isLooping={false}
          isMuted
          useNativeControls={false}
        />
      ) : item.feedItemType === FeedItemType.IMAGE_SLIDE && item.uri ? (
        // Fallback to image URI for IMAGE_SLIDE if no thumbnail
        <Image
          source={{ uri: item.uri }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
        />
      ) : null}

      {/* Icon Overlay - positioned to not cover bottom info */}
      <View
        className="absolute inset-0 justify-center items-center"
        style={{ zIndex: 1 }}
        pointerEvents="none"
      >
        <View className="bg-black/30 rounded-full p-2">
          {item.feedItemType === FeedItemType.IMAGE_SLIDE ? (
            <Ionicons name="images" size={20} color="white" />
          ) : (
            <Ionicons name="play" size={20} color="white" />
          )}
        </View>
      </View>

      {/* Bottom Info - metadata overlay with higher z-index */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: "rgba(0,0,0,0.75)",
          zIndex: 2,
          paddingVertical: 4,
          paddingHorizontal: 5,
        }}
      >
        <View className="flex-row items-center justify-start gap-2">
          {/* Likes */}
          <View className="flex-row items-center">
            <Ionicons name="heart" size={10} color="white" />
            <Text
              className="text-white text-[10px] ml-0.5 font-semibold"
              style={{
                textShadowColor: "rgba(0,0,0,0.75)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            >
              {formatNumber(item.likes || 0)}
            </Text>
          </View>

          {/* Comments */}
          {(item.comments || 0) > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="chatbubble" size={9} color="white" />
              <Text
                className="text-white text-[10px] ml-0.5 font-semibold"
                style={{
                  textShadowColor: "rgba(0,0,0,0.75)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {formatNumber(item.comments || 0)}
              </Text>
            </View>
          )}

          {/* Shares */}
          {(item.shares || 0) > 0 && (
            <View className="flex-row items-center">
              <Ionicons name="share" size={9} color="white" />
              <Text
                className="text-white text-[10px] ml-0.5 font-semibold"
                style={{
                  textShadowColor: "rgba(0,0,0,0.75)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 2,
                }}
              >
                {formatNumber(item.shares || 0)}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

