import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import { ChatMessageType } from "../../Types/common/ChatMessageType";
import { getAvatarUrl } from "../../Utils/ImageUrlHelper";
import { StyleSheet } from "react-native";

interface MessageBubbleProps {
  message: ChatMessageResponse;
  isMyMessage: boolean;
  isEditing: boolean;
  editText: string;
  onEditTextChange: (text: string) => void;
  onStartEditing: (message: ChatMessageResponse) => void;
  onCancelEditing: () => void;
  onSaveEdit: () => void;
  onDeleteMessage: (messageId: string) => void;
  isLoading: boolean;
}

export default function MessageBubble({
  message,
  isMyMessage,
  isEditing,
  editText,
  onEditTextChange,
  onStartEditing,
  onCancelEditing,
  onSaveEdit,
  onDeleteMessage,
  isLoading,
}: MessageBubbleProps) {
  const [isVideoBuffering, setIsVideoBuffering] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  useEffect(() => {
    setIsVideoBuffering(true);
    setIsVideoPlaying(false);
    setVideoError(null);
  }, [message.id, message.file?.url]);

  const isMediaMessage =
    (message.messageType === ChatMessageType.IMAGE ||
      message.messageType === ChatMessageType.VIDEO) &&
    !!message.file?.url;

  const hasCustomCaption = useMemo(() => {
    if (!message.message) return false;
    if (!message.file) return true;
    const autoCaption =
      message.file.originalFileName ||
      message.file.fileName ||
      message.file.url;
    return message.message.trim() !== (autoCaption?.trim() ?? "");
  }, [message.message, message.file]);

  const renderMediaPreview = () => {
    if (!isMediaMessage || !message.file?.url) {
      return null;
    }

    const mediaLabel =
      message.file.format?.toUpperCase() || message.messageType || "MEDIA";

    if (message.messageType === ChatMessageType.IMAGE) {
      return (
        <View
          className="overflow-hidden rounded-3xl border border-white/10 mb-3 bg-black/5"
          style={styles.mediaWrapper}
        >
          <Image
            source={{ uri: message.file.url }}
            style={styles.mediaElement}
            resizeMode="cover"
          />
        </View>
      );
    }

    const handlePlaybackStatusUpdate = (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.warn("Video playback error", status.error);
          setVideoError("Unable to load video");
          setIsVideoBuffering(false);
        }
        return;
      }

      setIsVideoPlaying(status.isPlaying ?? false);
      setIsVideoBuffering(status.isBuffering ?? false);
    };

    return (
      <View
        className="overflow-hidden rounded-3xl border border-white/10 mb-3 bg-black"
        style={styles.mediaWrapper}
      >
        <Video
          key={`${message.id}-${message.file.url}`}
          source={{ uri: message.file.url }}
          style={styles.mediaElement}
          resizeMode={ResizeMode.COVER}
          useNativeControls
          onLoadStart={() => {
            setIsVideoBuffering(true);
            setIsVideoPlaying(false);
          }}
          onReadyForDisplay={() => setIsVideoBuffering(false)}
          onError={(error) => {
            console.warn("Video playback error", error);
            setVideoError("Unable to load video");
            setIsVideoBuffering(false);
          }}
          onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        />
        <View
          className="absolute inset-0 items-center justify-center"
          pointerEvents="none"
        >
          {isVideoBuffering ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            !isVideoPlaying && (
              <View className="w-12 h-12 bg-black/40 rounded-full items-center justify-center border border-white/40">
                <Ionicons name="play" size={22} color="#ffffff" />
              </View>
            )
          )}
        </View>
        {!videoError ? (
          <View
            pointerEvents="none"
            className="absolute top-3 right-3 bg-black/45 rounded-full px-3 py-1 flex-row items-center"
          >
            <Ionicons name="videocam-outline" size={14} color="#fff" />
            <Text className="text-white text-[10px] font-semibold uppercase ml-1">
              Video
            </Text>
          </View>
        ) : (
          <View className="absolute inset-0 bg-black/75 items-center justify-center px-3">
            <Ionicons name="warning-outline" size={20} color="#FCA5A5" />
            <Text className="text-white text-xs text-center mt-2">
              {videoError}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const bubbleGradient = isMyMessage
    ? (["#111827", "#0F172A"] as [string, string])
    : (["#FFFFFF", "#F1F5F9"] as [string, string]);

  const bubbleStyles = [
    styles.bubbleBase,
    isMyMessage ? styles.myBubble : styles.otherBubble,
  ];

  if (isEditing) {
    return (
      <View className="mb-2 items-end">
        <View className="px-3 py-2 bg-gray-100 rounded-xl">
          <TextInput
            value={editText}
            onChangeText={onEditTextChange}
            className="bg-white rounded-lg px-2 py-1.5 mb-2 text-sm"
            multiline
            autoFocus
            maxLength={500}
          />
          <View className="flex-row justify-end space-x-1">
            <TouchableOpacity
              onPress={onCancelEditing}
              className="px-2 py-1 bg-gray-300 rounded-md"
            >
              <Text className="text-gray-700 text-xs">Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSaveEdit}
              className="px-2 py-1 bg-pink-600 rounded-md"
              disabled={!editText.trim()}
            >
              <Text className="text-white text-xs">Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View className={`mb-2 ${isMyMessage ? "items-end" : "items-start"}`}>
      <View
        className={`flex-row ${isMyMessage ? "flex-row-reverse" : "flex-row"} items-end`}
      >
        {/* Avatar for non-my messages */}
        {!isMyMessage && (
          <View className="mr-2 mb-1">
            {(() => {
              // Use the same logic as Profile screen
              const avatarUrl =
                message.avatar?.fileName && message.senderId
                  ? getAvatarUrl(message.senderId, message.avatar.fileName)
                  : null;
              return avatarUrl ? (
                <Image
                  source={{ uri: avatarUrl }}
                  className="w-8 h-8 rounded-full"
                  style={{
                    backgroundColor: "#f3f4f6",
                    resizeMode: "cover",
                  }}
                />
              ) : (
                <View className="w-8 h-8 rounded-full bg-gray-300 items-center justify-center">
                  <Text className="text-gray-700 text-sm font-bold">
                    {message.sender?.charAt(0).toUpperCase() || "?"}
                  </Text>
                </View>
              );
            })()}
          </View>
        )}

        <LinearGradient
          colors={bubbleGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={bubbleStyles}
        >
          {renderMediaPreview()}

          {!isMediaMessage || hasCustomCaption ? (
            <Text
              className={`text-sm leading-5 ${
                isMyMessage ? "text-white" : "text-gray-900"
              }`}
            >
              {message.message}
            </Text>
          ) : null}

          <View className="flex-row justify-between items-center mt-3">
            <View className="flex-row items-center space-x-2">
              <Text
                className={`text-[11px] ${
                  isMyMessage ? "text-white/70" : "text-gray-500"
                }`}
              >
                {new Date(message.createdAt as string).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>

              {/* Read status indicators for my messages */}
              {isMyMessage && (
                <View className="flex-row items-center space-x-1">
                  {message.readCount && message.readCount > 0 ? (
                    <View className="flex-row items-center space-x-1">
                      <Ionicons
                        name="checkmark-done"
                        size={12}
                        color={
                          message.isReadByCurrentUser ? "#34D399" : "#F9A8D4"
                        }
                      />
                      {message.readCount > 1 && (
                        <Text className="text-[11px] text-white/70">
                          {message.readCount}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Ionicons name="checkmark" size={12} color="#CBD5F5" />
                  )}
                </View>
              )}
            </View>

            {isMyMessage && (
              <View className="flex-row space-x-2">
                <TouchableOpacity
                  onPress={() => onStartEditing(message)}
                  className="p-1.5 bg-white/15 rounded-full"
                  activeOpacity={0.6}
                >
                  <Ionicons name="create-outline" size={14} color="#FFFFFF" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => onDeleteMessage(message.id)}
                  className="p-1.5 bg-white/15 rounded-full"
                  activeOpacity={0.6}
                >
                  <Ionicons name="trash-outline" size={14} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </LinearGradient>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleBase: {
    maxWidth: "85%",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
  },
  myBubble: {
    borderBottomRightRadius: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.35,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  otherBubble: {
    borderBottomLeftRadius: 10,
    shadowColor: "#0f172a",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  mediaWrapper: {
    width: "100%",
    aspectRatio: 4 / 3,
    alignSelf: "stretch",
    backgroundColor: "#000",
  },
  mediaElement: {
    width: "100%",
    height: "100%",
    backgroundColor: "#000",
  },
});
