import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Video, ResizeMode, AVPlaybackStatus } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { ChatMessageResponse } from "../../Types/response/ChatMessageResponse";
import { ChatMessageType } from "../../Types/common/ChatMessageType";
import { getAvatarUrl, UNKNOWN_AVATAR } from "../../Utils/ImageUrlHelper";
import SharedVideoMessage from "./SharedVideoMessage";

const SCREEN_WIDTH = Dimensions.get("window").width;
const MAX_BUBBLE_WIDTH = Math.min(SCREEN_WIDTH * 0.8, SCREEN_WIDTH - 80);
const MAX_MEDIA_WIDTH = Math.min(SCREEN_WIDTH * 0.9, SCREEN_WIDTH - 48);

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
  const [fullScreenImageUrl, setFullScreenImageUrl] = useState<string | null>(
    null
  );
  const [showActionSheet, setShowActionSheet] = useState(false);

  useEffect(() => {
    setIsVideoBuffering(true);
    setIsVideoPlaying(false);
    setVideoError(null);
    setFullScreenImageUrl(null);
  }, [message.id, message.file?.url]);

  const isMediaMessage =
    (message.messageType === ChatMessageType.IMAGE ||
      message.messageType === ChatMessageType.VIDEO) &&
    !!message.file?.url;

  const isTextMessage = message.messageType === ChatMessageType.TEXT;
  const shouldShowBubble = isTextMessage;

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

    if (message.messageType === ChatMessageType.IMAGE) {
      return (
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => setFullScreenImageUrl(message.file!.url)}
        >
          <View
            className="self-stretch overflow-hidden rounded-3xl border border-white/10 mb-3 bg-black/5"
            style={mediaWrapperStyle}
          >
            <Image
              source={{ uri: message.file.url }}
              className="w-full h-full"
              resizeMode="cover"
            />
          </View>
        </TouchableOpacity>
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
        className="self-stretch overflow-hidden rounded-3xl border border-white/10 mb-3 bg-black"
        style={mediaWrapperStyle}
      >
        <Video
          key={`${message.id}-${message.file.url}`}
          source={{ uri: message.file.url }}
          className="w-full h-full bg-black"
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

  const bubbleClassName = [
    "px-4 py-3 rounded-[28px] border border-white/5 shrink",
    isMyMessage
      ? "rounded-br-[10px] shadow-lg shadow-slate-900/40"
      : "rounded-bl-[10px] shadow-md shadow-slate-900/10",
  ].join(" ");

  const bubbleContainerStyle = {
    maxWidth: MAX_BUBBLE_WIDTH,
    flexShrink: 1,
  };

  const nonBubbleContainerStyle = {
    maxWidth: MAX_MEDIA_WIDTH,
    flexShrink: 1,
    marginTop: 4,
  };

  const mediaWrapperStyle = {
    aspectRatio: 4 / 3,
  };

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

  const renderMainContent = () => {
    if (
      message.messageType === ChatMessageType.SHARED_VIDEO &&
      message.feedItemId
    ) {
      return (
        <SharedVideoMessage
          feedItemId={message.feedItemId}
          messageText={message.message}
          isMyMessage={isMyMessage}
        />
      );
    }

    if (isMediaMessage) {
      return (
        <>
          {renderMediaPreview()}
          {hasCustomCaption && message.message ? (
            <Text
              className={`text-sm mt-2 ${
                isMyMessage ? "text-white/90" : "text-gray-900"
              }`}
            >
              {message.message}
            </Text>
          ) : null}
        </>
      );
    }

    return (
      <Text
        className={`text-sm leading-5 ${
          isMyMessage ? "text-white" : "text-gray-900"
        }`}
      >
        {message.message}
      </Text>
    );
  };

  const renderMetaInfo = (withinBubble: boolean) => {
    const timestampColor = withinBubble
      ? isMyMessage
        ? "#ffffffb3"
        : "#475569"
      : isMyMessage
        ? "#cbd5f5"
        : "#475569";

    const rowClasses = withinBubble
      ? "flex-row justify-between items-center mt-3"
      : "flex-row justify-between items-center mt-1 max-w-[90%]";

    return (
      <View
        className={`${rowClasses} ${isMyMessage ? "self-end" : "self-start"}`}
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-[11px]" style={{ color: timestampColor }}>
            {new Date(message.createdAt as string).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
          {isMyMessage && (
            <View className="flex-row items-center gap-1">
              {message.readCount && message.readCount > 0 ? (
                <View className="flex-row items-center gap-1">
                  <Ionicons
                    name="checkmark-done"
                    size={12}
                    color={message.isReadByCurrentUser ? "#34D399" : "#F9A8D4"}
                  />
                  {message.readCount > 1 && (
                    <Text
                      className="text-[11px]"
                      style={{ color: timestampColor }}
                    >
                      {message.readCount}
                    </Text>
                  )}
                </View>
              ) : (
                <Ionicons name="checkmark" size={12} color={timestampColor} />
              )}
            </View>
          )}
        </View>
      </View>
    );
  };

  const mainContent = renderMainContent();

  const bubbleWrapperAlignment = isMyMessage ? "self-end" : "self-start";

  const contentNode = shouldShowBubble ? (
    <TouchableOpacity
      activeOpacity={0.9}
      onLongPress={() => setShowActionSheet(isMyMessage)}
      delayLongPress={250}
      style={bubbleContainerStyle}
      className={`shrink ${bubbleWrapperAlignment}`}
    >
      <LinearGradient
        colors={bubbleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={bubbleClassName}
      >
        {mainContent}
        {renderMetaInfo(true)}
      </LinearGradient>
    </TouchableOpacity>
  ) : (
    <View
      style={[nonBubbleContainerStyle]}
      className={`shrink ${bubbleWrapperAlignment}`}
    >
      {mainContent}
    </View>
  );

  return (
    <View className={`mb-2 ${isMyMessage ? "items-end" : "items-start"}`}>
      <View
        className={`flex-row ${isMyMessage ? "flex-row-reverse" : "flex-row"} items-end`}
      >
        {!isMyMessage && (
          <View className="mr-2 mb-1">
            {(() => {
              const avatarUrl =
                message.avatar?.fileName && message.senderId
                  ? getAvatarUrl(message.senderId, message.avatar.fileName)
                  : null;
              const avatarSource = avatarUrl
                ? { uri: avatarUrl }
                : UNKNOWN_AVATAR;
              return (
                <Image
                  source={avatarSource}
                  className="w-8 h-8 rounded-full"
                  style={{
                    backgroundColor: "#f3f4f6",
                    resizeMode: "cover",
                  }}
                />
              );
            })()}
          </View>
        )}

        {contentNode}
      </View>

      {!shouldShowBubble && renderMetaInfo(false)}

      <Modal
        visible={!!fullScreenImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImageUrl(null)}
      >
        <View className="flex-1 bg-black/95">
          <TouchableOpacity
            className="absolute top-14 right-6 w-10 h-10 rounded-full bg-white/15 items-center justify-center z-10"
            onPress={() => setFullScreenImageUrl(null)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={20} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={() => setFullScreenImageUrl(null)}
          >
            <View className="flex-1 items-center justify-center px-4">
              {fullScreenImageUrl && (
                <Image
                  source={{ uri: fullScreenImageUrl }}
                  className="w-full h-full"
                  resizeMode="contain"
                />
              )}
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal
        visible={showActionSheet}
        transparent
        animationType="fade"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-slate-900/55"
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        />
        <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white p-5 gap-3 shadow-2xl">
          <Text className="text-base font-semibold text-slate-900 text-center mb-1">
            Message actions
          </Text>
          <TouchableOpacity
            className="flex-row items-center py-3 px-1"
            onPress={() => {
              setShowActionSheet(false);
              onStartEditing(message);
            }}
          >
            <Ionicons
              name="create-outline"
              size={18}
              color="#0f172a"
              style={{ marginRight: 12 }}
            />
            <Text className="text-[15px] text-slate-900 font-medium">
              Edit message
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center py-3 px-1"
            onPress={() => {
              setShowActionSheet(false);
              onDeleteMessage(message.id);
            }}
          >
            <Ionicons
              name="trash-outline"
              size={18}
              color="#dc2626"
              style={{ marginRight: 12 }}
            />
            <Text
              className="text-[15px] font-medium"
              style={{ color: "#dc2626" }}
            >
              Delete message
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-1 py-3 items-center rounded-xl bg-slate-100"
            onPress={() => setShowActionSheet(false)}
          >
            <Text className="text-[15px] text-slate-900 font-semibold">
              Cancel
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
