import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import ChatMessageService from "../Services/ChatMessageService";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";

interface UseMediaPickerProps {
  conversationId: string;
  onMessageAdded: (message: ChatMessageResponse) => void;
}

export const useMediaPicker = ({
  conversationId,
  onMessageAdded,
}: UseMediaPickerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestPermissions = async (): Promise<boolean> => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Sorry, we need camera roll permissions to make this work!"
      );
      return false;
    }
    return true;
  };

  const handleImagePick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        type: asset.mimeType || "image/jpeg",
        name: asset.fileName || `image-${Date.now()}.jpg`,
      };

      try {
        setIsLoading(true);
        const response = await ChatMessageService.sendAttachment(
          conversationId,
          file
        );
        if (response.result) {
          onMessageAdded(response.result);
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        Alert.alert("Error", "Failed to upload image.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleVideoPick = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      const file = {
        uri: asset.uri,
        type: asset.mimeType || "video/mp4",
        name: asset.fileName || `video-${Date.now()}.mp4`,
      };

      try {
        setIsLoading(true);
        const response = await ChatMessageService.sendAttachment(
          conversationId,
          file
        );
        if (response.result) {
          onMessageAdded(response.result);
        }
      } catch (error) {
        console.error("Error uploading video:", error);
        Alert.alert("Error", "Failed to upload video.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    handleImagePick,
    handleVideoPick,
    isLoading,
  };
};

