import React, { useState, useRef } from "react";
import {
  Dimensions,
  Alert,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Video } from "expo-av";
import { uploadVideo } from "../../Services/VideoService";
import { uploadImageSlide } from "../../Services/ImageSlideService";
import { useDispatch } from "react-redux";
import { clearVideos } from "../../Store/videoSlice";
import {
  UploadHeader,
  UploadTypeSelector,
  EmptyState,
  VideoPreview,
  ImagePreview,
  UploadForm,
} from "../../Components/Upload";
import {
  UploadType,
  VideoData,
  ThumbnailData,
  ImageData,
} from "../../Types/request";

const { height } = Dimensions.get("window");

export default function Upload() {
  const [uploadType, setUploadType] = useState<UploadType>("video");
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
  const [selectedImages, setSelectedImages] = useState<ImageData[]>([]);
  const [thumbnail, setThumbnail] = useState<ThumbnailData | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hashTags, setHashTags] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const videoRef = useRef<Video | null>(null);
  const dispatch = useDispatch();

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to access your media library."
      );
      return false;
    }
    return true;
  };

  const pickVideo = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
        videoMaxDuration: 60,
      });

      if (!result.canceled && result.assets[0]) {
        const video = result.assets[0];
        setSelectedVideo({
          uri: video.uri,
          fileName: video.fileName || `video_${Date.now()}.mp4`,
          duration: video.duration || 0,
          width: video.width || undefined,
          height: video.height || undefined,
        });

        if (video.duration) {
          console.log("Video duration:", video.duration, "seconds");
        }
      }
    } catch (error) {
      console.error("Error picking video:", error);
      Alert.alert("Error", "Failed to pick video. Please try again.");
    }
  };

  const pickImages = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
        aspect: [9, 16],
      });

      if (!result.canceled && result.assets.length > 0) {
        const images = result.assets.map((asset) => ({
          uri: asset.uri,
          fileName: asset.fileName || `image_${Date.now()}.jpg`,
          width: asset.width,
          height: asset.height,
        }));
        setSelectedImages(images);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Error", "Failed to pick images. Please try again.");
    }
  };

  const pickThumbnail = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.8,
        aspect: [9, 16],
      });

      if (!result.canceled && result.assets[0]) {
        const image = result.assets[0];
        setThumbnail({
          uri: image.uri,
          fileName: `thumbnail_${Date.now()}.jpg`,
        });
      }
    } catch (error) {
      console.error("Error picking thumbnail:", error);
      Alert.alert("Error", "Failed to pick thumbnail. Please try again.");
    }
  };

  const removeContent = () => {
    setSelectedVideo(null);
    setSelectedImages([]);
    setThumbnail(null);
    setTitle("");
    setDescription("");
    setHashTags("");
  };

  const removeImage = (index: number) => {
    const updatedImages = selectedImages.filter((_, i) => i !== index);
    setSelectedImages(updatedImages);
  };

  const handleTypeChange = (type: UploadType) => {
    setUploadType(type);
    removeContent();
  };

  const handleUpload = async () => {
    if (uploadType === "video") {
      if (!selectedVideo) {
        Alert.alert("No Video", "Please select a video to upload.");
        return;
      }

      if (!title.trim()) {
        Alert.alert("Title Required", "Please enter a title for your video.");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();
        formData.append("file", {
          uri: selectedVideo.uri,
          type: "video/mp4",
          name: selectedVideo.fileName,
        } as any);
        formData.append("title", title.trim());
        if (description.trim()) {
          formData.append("description", description.trim());
        }
        if (thumbnail) {
          formData.append("thumbnail", {
            uri: thumbnail.uri,
            type: "image/jpeg",
            name: thumbnail.fileName,
          } as any);
        }
        if (selectedVideo.duration && selectedVideo.duration > 0) {
          formData.append("duration", selectedVideo.duration.toString());
        }
        if (hashTags.trim()) {
          formData.append("hashTags", hashTags.trim());
        }

        await uploadVideo(formData, (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        });

        dispatch(clearVideos());

        Alert.alert("Success", "Video uploaded successfully!", [
          {
            text: "OK",
            onPress: () => {
              removeContent();
              setIsUploading(false);
              setUploadProgress(0);
            },
          },
        ]);
      } catch (error) {
        console.error("Upload error:", error);
        Alert.alert(
          "Upload Failed",
          "Failed to upload video. Please try again."
        );
        setIsUploading(false);
        setUploadProgress(0);
      }
    } else {
      if (selectedImages.length === 0) {
        Alert.alert("No Images", "Please select at least one image to upload.");
        return;
      }

      setIsUploading(true);
      setUploadProgress(0);

      try {
        const formData = new FormData();

        selectedImages.forEach((image) => {
          formData.append("images", {
            uri: image.uri,
            type: "image/jpeg",
            name: image.fileName,
          } as any);
        });

        if (description.trim()) {
          formData.append("captions", description.trim());
        }

        if (thumbnail) {
          formData.append("thumbnail", {
            uri: thumbnail.uri,
            type: "image/jpeg",
            name: thumbnail.fileName,
          } as any);
        }

        if (hashTags.trim()) {
          formData.append("hashTags", hashTags.trim());
        }

        await uploadImageSlide(formData, (progressEvent: any) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || 1)
          );
          setUploadProgress(progress);
        });

        dispatch(clearVideos());

        Alert.alert("Success", "Image slides uploaded successfully!", [
          {
            text: "OK",
            onPress: () => {
              removeContent();
              setIsUploading(false);
              setUploadProgress(0);
            },
          },
        ]);
      } catch (error) {
        console.error("Upload error:", error);
        Alert.alert(
          "Upload Failed",
          "Failed to upload image slides. Please try again."
        );
        setIsUploading(false);
        setUploadProgress(0);
      }
    }
  };

  const showEmptyState = () => {
    if (uploadType === "video" && !selectedVideo) return true;
    if (uploadType === "imageSlide" && selectedImages.length === 0) return true;
    return false;
  };

  const showUploadForm = () => {
    if (uploadType === "video" && !selectedVideo) return false;
    if (uploadType === "imageSlide" && selectedImages.length === 0)
      return false;
    return true;
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <UploadHeader />
      <UploadTypeSelector
        uploadType={uploadType}
        onTypeChange={handleTypeChange}
      />
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {showEmptyState() ? (
          <EmptyState
            type={uploadType}
            onSelect={uploadType === "video" ? pickVideo : pickImages}
          />
        ) : (
          <>
            {uploadType === "video" && selectedVideo && (
              <VideoPreview
                video={selectedVideo}
                onRemove={removeContent}
                videoRef={videoRef}
                height={height}
              />
            )}
            {uploadType === "imageSlide" && (
              <ImagePreview
                images={selectedImages}
                onRemoveImage={removeImage}
              />
            )}
            {showUploadForm() && (
              <UploadForm
                uploadType={uploadType}
                title={title}
                description={description}
                hashTags={hashTags}
                thumbnail={thumbnail}
                selectedVideo={selectedVideo || undefined}
                selectedImagesLength={selectedImages.length}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                onTitleChange={setTitle}
                onDescriptionChange={setDescription}
                onHashTagsChange={setHashTags}
                onPickThumbnail={pickThumbnail}
                onRemoveThumbnail={() => setThumbnail(null)}
                onUpload={handleUpload}
              />
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
