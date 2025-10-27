import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UploadType, ThumbnailData } from "../../../Types/request";

interface UploadFormProps {
  uploadType: UploadType;
  title: string;
  description: string;
  hashTags: string;
  thumbnail: ThumbnailData | null;
  selectedVideo?: {
    duration?: number;
  };
  selectedImagesLength: number;
  isUploading: boolean;
  uploadProgress: number;
  onTitleChange: (text: string) => void;
  onDescriptionChange: (text: string) => void;
  onHashTagsChange: (text: string) => void;
  onPickThumbnail: () => void;
  onRemoveThumbnail: () => void;
  onUpload: () => void;
}

export const UploadForm: React.FC<UploadFormProps> = ({
  uploadType,
  title,
  description,
  hashTags,
  thumbnail,
  selectedVideo,
  selectedImagesLength,
  isUploading,
  uploadProgress,
  onTitleChange,
  onDescriptionChange,
  onHashTagsChange,
  onPickThumbnail,
  onRemoveThumbnail,
  onUpload,
}) => {
  const isVideo = uploadType === "video";

  return (
    <View className="p-4">
      <Text
        className="text-xl font-semibold text-white mb-5"
        style={{ fontFamily: "TikTokSans-SemiBold" }}
      >
        {isVideo ? "Video Details" : "Image Slide Details"}
      </Text>

      {isVideo && (
        <View className="mb-5">
          <Text
            className="text-base font-medium text-white mb-2"
            style={{ fontFamily: "TikTokSans-Medium" }}
          >
            Title *
          </Text>
          <TextInput
            className="bg-white/10 rounded-xl px-4 py-3 text-base text-white border border-white/20 focus:border-pink-500"
            placeholder="Enter video title..."
            placeholderTextColor="#999"
            value={title}
            onChangeText={onTitleChange}
            maxLength={100}
            style={{ fontFamily: "TikTokSans-Regular" }}
          />
          <Text
            className="text-xs text-gray-500 text-right mt-1"
            style={{ fontFamily: "TikTokSans-Regular" }}
          >
            {title.length}/100
          </Text>
        </View>
      )}

      <View className="mb-5">
        <Text
          className="text-base font-medium text-white mb-2"
          style={{ fontFamily: "TikTokSans-Medium" }}
        >
          {isVideo ? "Description" : "Captions"}
        </Text>
        <TextInput
          className="bg-white/10 rounded-xl px-4 py-3 text-base text-white border border-white/20 h-24"
          placeholder={
            isVideo
              ? "Describe your video..."
              : "Add captions for your images..."
          }
          placeholderTextColor="#999"
          value={description}
          onChangeText={onDescriptionChange}
          multiline
          numberOfLines={4}
          maxLength={500}
          textAlignVertical="top"
          style={{ fontFamily: "TikTokSans-Regular" }}
        />
        <Text
          className="text-xs text-gray-500 text-right mt-1"
          style={{ fontFamily: "TikTokSans-Regular" }}
        >
          {description.length}/500
        </Text>
      </View>

      <View className="mb-5">
        <Text
          className="text-base font-medium text-white mb-2"
          style={{ fontFamily: "TikTokSans-Medium" }}
        >
          Thumbnail (Optional)
        </Text>
        <View className="mt-2">
          {thumbnail ? (
            <View className="relative w-40 h-22.5 rounded-xl overflow-hidden bg-white/10 border border-white/20">
              <Image
                source={{ uri: thumbnail.uri }}
                className="w-full h-full"
              />
              <TouchableOpacity
                className="absolute top-2 right-2 bg-black/70 rounded-xl p-1"
                onPress={onRemoveThumbnail}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              className="flex-row items-center justify-center bg-white/10 border-2 border-dashed border-pink-500 rounded-xl py-5 px-8 active:bg-white/15"
              onPress={onPickThumbnail}
            >
              <Ionicons name="image-outline" size={24} color="#FE2C55" />
              <Text
                className="text-pink-500 text-base font-semibold ml-2"
                style={{ fontFamily: "TikTokSans-SemiBold" }}
              >
                Add Thumbnail
              </Text>
            </TouchableOpacity>
          )}
        </View>
        <Text
          className="text-xs text-gray-500 mt-1"
          style={{ fontFamily: "TikTokSans-Regular" }}
        >
          Select a custom thumbnail
        </Text>
      </View>

      <View className="mb-5">
        <Text
          className="text-base font-medium text-white mb-2"
          style={{ fontFamily: "TikTokSans-Medium" }}
        >
          HashTags (Optional)
        </Text>
        <TextInput
          className="bg-white/10 rounded-xl px-4 py-3 text-base text-white border border-white/20"
          placeholder="e.g., funny, dance, music"
          placeholderTextColor="#999"
          value={hashTags}
          onChangeText={onHashTagsChange}
          maxLength={200}
          style={{ fontFamily: "TikTokSans-Regular" }}
        />
        <Text
          className="text-xs text-gray-500 text-right mt-1"
          style={{ fontFamily: "TikTokSans-Regular" }}
        >
          {hashTags.length}/200 (comma-separated)
        </Text>
        <Text
          className="text-xs text-gray-500 mt-1"
          style={{ fontFamily: "TikTokSans-Regular" }}
        >
          Separate tags with commas
        </Text>
      </View>

      {isVideo && selectedVideo?.duration && selectedVideo.duration > 0 && (
        <View className="flex-row items-center bg-pink-500/10 p-3 rounded-lg mb-5 border border-pink-500/20">
          <Ionicons name="time-outline" size={16} color="#FE2C55" />
          <Text
            className="text-pink-500 text-sm font-semibold ml-2"
            style={{ fontFamily: "TikTokSans-SemiBold" }}
          >
            Video Duration: {Math.round(selectedVideo.duration)}s
          </Text>
        </View>
      )}

      <TouchableOpacity
        className={`bg-pink-500 rounded-xl py-4 items-center mt-5 shadow-lg ${
          (isVideo && !title.trim()) || isUploading ? "opacity-50" : ""
        }`}
        onPress={onUpload}
        disabled={(isVideo && !title.trim()) || isUploading}
      >
        {isUploading ? (
          <View className="flex-row items-center">
            <ActivityIndicator size="small" color="#fff" />
            <Text
              className="text-white text-base font-semibold ml-2"
              style={{ fontFamily: "TikTokSans-SemiBold" }}
            >
              Uploading... {uploadProgress}%
            </Text>
          </View>
        ) : (
          <Text
            className="text-white text-base font-semibold"
            style={{ fontFamily: "TikTokSans-SemiBold" }}
          >
            {isVideo ? "Upload Video" : "Upload Image Slide"}
          </Text>
        )}
      </TouchableOpacity>

      {isUploading && (
        <View className="mt-4">
          <View className="h-1 bg-white/20 rounded-sm overflow-hidden">
            <View
              className="h-full bg-pink-500 rounded-sm"
              style={{ width: `${uploadProgress}%` }}
            />
          </View>
        </View>
      )}
    </View>
  );
};
