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
          activeOpacity={0.9}
          onPress={() => setFullScreenImageUrl(message.file!.url)}
          className="shadow-lg"
        >
          <View
            className="overflow-hidden rounded-2xl border border-gray-200/50 mb-3 bg-gray-100"
            style={mediaWrapperStyle}
          >
            <Image
              source={{ uri: message.file.url }}
              style={{ width: "100%", height: "100%" }}
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
        className="overflow-hidden rounded-2xl border border-gray-200/50 mb-3 bg-black shadow-lg"
        style={mediaWrapperStyle}
      >
        <Video
          key={`${message.id}-${message.file.url}`}
          source={{ uri: message.file.url }}
          style={{
            width: "100%",
            height: "100%",
            backgroundColor: "#000000",
          }}
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
              <View className="w-14 h-14 bg-black/50 rounded-full items-center justify-center border-2 border-white/50 shadow-xl">
                <Ionicons
                  name="play"
                  size={24}
                  color="#ffffff"
                  className="ml-0.5"
                />
              </View>
            )
          )}
        </View>
        {!videoError ? (
          <View
            pointerEvents="none"
            className="absolute top-3 right-3 bg-black/60 rounded-full px-3 py-1.5 flex-row items-center backdrop-blur-sm shadow-md"
          >
            <Ionicons name="videocam-outline" size={15} color="#fff" />
            <Text className="text-white text-[11px] font-semibold uppercase ml-1.5 tracking-wide">
              Video
            </Text>
          </View>
        ) : (
          <View className="absolute inset-0 bg-black/80 items-center justify-center px-4 rounded-2xl">
            <Ionicons name="warning-outline" size={24} color="#FCA5A5" />
            <Text className="text-white text-sm text-center mt-3 font-medium">
              {videoError}
            </Text>
          </View>
        )}
      </View>
    );
  };

  const bubbleGradient = isMyMessage
    ? (["#8B5CF6", "#6366F1"] as [string, string]) // Purple-to-blue gradient for sent messages (matches image)
    : (["#FFFFFF", "#FFFFFF"] as [string, string]); // Pure white for received messages (matches image)

  const bubbleClassName = [
    "px-4 py-3 shrink",
    !isMyMessage ? "border border-gray-200/60" : "",
  ].join(" ");

  const bubbleStyle = {
    borderRadius: 20,
    ...(isMyMessage
      ? { borderBottomRightRadius: 8 }
      : { borderBottomLeftRadius: 8 }),
  };

  const mediaWrapperStyle = {
    aspectRatio: 4 / 3,
    alignSelf: "stretch" as const,
  };

  if (isEditing) {
    return (
      <View className="mb-3 items-end">
        <View
          className="px-4 py-3.5 bg-white rounded-2xl border border-gray-200 shadow-lg"
          style={{ maxWidth: MAX_BUBBLE_WIDTH }}
        >
          <TextInput
            value={editText}
            onChangeText={onEditTextChange}
            className="bg-gray-50 rounded-xl px-3.5 py-2.5 mb-3 text-[15px] text-gray-900 border border-gray-200 min-h-[60px]"
            multiline
            autoFocus
            maxLength={500}
            placeholderTextColor="#9CA3AF"
            textAlignVertical="top"
          />
          <View className="flex-row justify-end gap-2">
            <TouchableOpacity
              onPress={onCancelEditing}
              className="px-4 py-2 bg-gray-100 rounded-xl active:bg-gray-200"
              activeOpacity={0.7}
            >
              <Text className="text-gray-700 text-sm font-semibold">
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={onSaveEdit}
              className={`px-4 py-2 rounded-xl active:opacity-80 ${
                editText.trim() ? "bg-indigo-500" : "bg-gray-400"
              }`}
              disabled={!editText.trim()}
              activeOpacity={0.8}
            >
              <Text className="text-white text-sm font-semibold">Save</Text>
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
              className={`text-[15px] leading-6 mt-3 tracking-wide ${
                isMyMessage ? "text-white/95" : "text-gray-900"
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
        className={`text-[15px] leading-5 tracking-wide ${
          isMyMessage ? "text-white font-medium" : "text-gray-900 font-medium"
        }`}
      >
        {message.message}
      </Text>
    );
  };

  const renderMetaInfo = (withinBubble: boolean) => {
    const timestampColorClass = withinBubble
      ? isMyMessage
        ? "text-white/80"
        : "text-slate-500"
      : isMyMessage
        ? "text-indigo-300"
        : "text-slate-500";

    const timestampColor = withinBubble
      ? isMyMessage
        ? "#ffffffcc"
        : "#64748B"
      : isMyMessage
        ? "#A5B4FC"
        : "#64748B";

    const rowClasses = withinBubble
      ? "flex-row justify-between items-center mt-2.5"
      : "flex-row justify-between items-center mt-2 max-w-[90%]";

    return (
      <View
        className={`${rowClasses} ${isMyMessage ? "self-end" : "self-start"}`}
      >
        <View className="flex-row items-center gap-1.5">
          <Text
            className={`text-[11px] font-medium opacity-85 ${timestampColorClass}`}
          >
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
                    size={13}
                    color={message.isReadByCurrentUser ? "#10B981" : "#F472B6"}
                  />
                  {message.readCount > 1 && (
                    <Text
                      className={`text-[10px] font-semibold opacity-90 ${timestampColorClass}`}
                    >
                      {message.readCount}
                    </Text>
                  )}
                </View>
              ) : (
                <Ionicons name="checkmark" size={13} color={timestampColor} />
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
      activeOpacity={0.95}
      onLongPress={() => setShowActionSheet(isMyMessage)}
      delayLongPress={250}
      style={{
        maxWidth: MAX_BUBBLE_WIDTH,
      }}
      className={`${isMyMessage ? "shadow-lg shadow-indigo-500/25" : "shadow-md"}`}
    >
      <LinearGradient
        colors={bubbleGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className={bubbleClassName}
        style={bubbleStyle}
      >
        {mainContent}
        {renderMetaInfo(true)}
      </LinearGradient>
    </TouchableOpacity>
  ) : (
    <View
      style={{
        maxWidth: MAX_MEDIA_WIDTH,
        marginTop: 4,
      }}
      className="shadow-md"
    >
      {mainContent}
    </View>
  );

  return (
    <View
      className="mb-2"
      style={{
        width: "100%",
        paddingHorizontal: 0,
      }}
    >
      <View
        className="flex-row items-end"
        style={{
          width: "100%",
          justifyContent: isMyMessage ? "flex-end" : "flex-start",
        }}
      >
        {!isMyMessage && (
          <View className="mr-2.5 mb-0.5" style={{ flexShrink: 0 }}>
            {(() => {
              const avatarUrl =
                message.avatar?.fileName && message.senderId
                  ? getAvatarUrl(message.senderId, message.avatar.fileName)
                  : null;
              const avatarSource = avatarUrl
                ? { uri: avatarUrl }
                : UNKNOWN_AVATAR;
              return (
                <View className="shadow-sm">
                  <Image
                    source={avatarSource}
                    className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white"
                    resizeMode="cover"
                  />
                </View>
              );
            })()}
          </View>
        )}

        <View
          style={{
            flexShrink: 1,
            maxWidth: MAX_BUBBLE_WIDTH,
          }}
        >
          {contentNode}
        </View>
      </View>

      {!shouldShowBubble && (
        <View
          style={{
            width: "100%",
            alignItems: isMyMessage ? "flex-end" : "flex-start",
          }}
        >
          {renderMetaInfo(false)}
        </View>
      )}

      <Modal
        visible={!!fullScreenImageUrl}
        transparent
        animationType="fade"
        onRequestClose={() => setFullScreenImageUrl(null)}
      >
        <View className="flex-1 bg-black">
          <TouchableOpacity
            className="absolute top-14 right-6 w-11 h-11 rounded-full bg-black/40 items-center justify-center z-10 border border-white/20 shadow-xl"
            onPress={() => setFullScreenImageUrl(null)}
            activeOpacity={0.7}
          >
            <Ionicons name="close" size={22} color="#fff" />
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
        animationType="slide"
        onRequestClose={() => setShowActionSheet(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50"
          activeOpacity={1}
          onPress={() => setShowActionSheet(false)}
        />
        <View className="absolute bottom-0 left-0 right-0 rounded-t-[28px] bg-white pt-5 pb-8 px-5 shadow-2xl">
          <View className="w-12 h-1 bg-gray-300 rounded-full self-center mb-4" />
          <Text className="text-lg font-bold text-gray-900 text-center mb-6">
            Message Options
          </Text>
          <TouchableOpacity
            className="flex-row items-center py-4 px-2 rounded-xl active:bg-gray-50"
            onPress={() => {
              setShowActionSheet(false);
              onStartEditing(message);
            }}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-indigo-100 items-center justify-center mr-3">
              <Ionicons name="create-outline" size={20} color="#6366F1" />
            </View>
            <Text className="text-[16px] text-gray-900 font-semibold flex-1">
              Edit message
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-row items-center py-4 px-2 rounded-xl active:bg-red-50 mt-2"
            onPress={() => {
              setShowActionSheet(false);
              onDeleteMessage(message.id);
            }}
            activeOpacity={0.7}
          >
            <View className="w-10 h-10 rounded-full bg-red-100 items-center justify-center mr-3">
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </View>
            <Text className="text-[16px] font-semibold flex-1 text-red-500">
              Delete message
            </Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <TouchableOpacity
            className="mt-4 py-4 items-center rounded-xl bg-gray-100 active:bg-gray-200"
            onPress={() => setShowActionSheet(false)}
            activeOpacity={0.7}
          >
            <Text className="text-[16px] text-gray-700 font-bold">Cancel</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
