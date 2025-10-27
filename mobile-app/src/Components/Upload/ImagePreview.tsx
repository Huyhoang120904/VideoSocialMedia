import React from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ImageData } from "../../../Types/request";

interface ImagePreviewProps {
  images: ImageData[];
  onRemoveImage: (index: number) => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  images,
  onRemoveImage,
}) => {
  if (images.length === 0) return null;

  return (
    <View className="m-4 mb-2">
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-row"
      >
        {images.map((image, index) => (
          <View key={index} className="relative mr-3">
            <Image
              source={{ uri: image.uri }}
              className="w-30 h-40 rounded-xl border border-white/10"
            />
            <TouchableOpacity
              className="absolute top-2 right-2 bg-black/70 rounded-full p-1 shadow-lg"
              onPress={() => onRemoveImage(index)}
            >
              <Ionicons name="close-circle" size={24} color="#ff4444" />
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};
