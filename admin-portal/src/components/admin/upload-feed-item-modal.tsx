"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { feedItemService } from "@/services/api";
import { FeedItemType, UploadFeedItemRequest } from "@/types";
import { toast } from "sonner";
import { Upload, FileVideo, Image as ImageIcon, X } from "lucide-react";

interface UploadFeedItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFeedItemUploaded: () => void;
}

export default function UploadFeedItemModal({
  open,
  onOpenChange,
  onFeedItemUploaded,
}: UploadFeedItemModalProps) {
  const [formData, setFormData] = useState<UploadFeedItemRequest>({
    feedItemType: FeedItemType.VIDEO,
    title: "",
    description: "",
    hashTags: [],
  });
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [hashTagInput, setHashTagInput] = useState("");

  const resetForm = () => {
    setFormData({
      feedItemType: FeedItemType.VIDEO,
      title: "",
      description: "",
      hashTags: [],
    });
    setHashTagInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.feedItemType === FeedItemType.VIDEO && !formData.videoFile) {
      toast.error("Please select a video file");
      return;
    }

    if (formData.feedItemType === FeedItemType.IMAGE_SLIDE && (!formData.images || formData.images.length === 0)) {
      toast.error("Please select at least one image");
      return;
    }

    try {
      setLoading(true);
      const response = await feedItemService.uploadFeedItem(formData);
      if (response.code === 1000) {
        toast.success("Feed item uploaded successfully");
        resetForm();
        onOpenChange(false);
        onFeedItemUploaded();
      } else {
        toast.error(response.message || "Failed to upload feed item");
      }
    } catch (error: any) {
      console.error("Failed to upload feed item:", error);
      toast.error(error.response?.data?.message || "Failed to upload feed item");
    } finally {
      setLoading(false);
    }
  };

  const handleVideoFileChange = (file: File | null) => {
    if (file) {
      // Check file type
      if (!file.type.startsWith("video/")) {
        toast.error("Please select a video file");
        return;
      }

      // Check file size (100MB limit for videos)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file size must be less than 100MB");
        return;
      }

      setFormData((prev) => ({ ...prev, videoFile: file }));
    } else {
      setFormData((prev) => ({ ...prev, videoFile: undefined }));
    }
  };

  const handleImagesChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      const imageFiles: File[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Check file type
        if (!file.type.startsWith("image/")) {
          toast.error(`File ${file.name} is not an image`);
          continue;
        }

        // Check file size (10MB limit per image)
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`Image ${file.name} size must be less than 10MB`);
          continue;
        }

        imageFiles.push(file);
      }

      if (imageFiles.length > 0) {
        setFormData((prev) => ({ 
          ...prev, 
          images: [...(prev.images || []), ...imageFiles]
        }));
      }
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images?.filter((_, i) => i !== index),
    }));
  };

  const handleThumbnailChange = (file: File | null) => {
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file for thumbnail");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Thumbnail size must be less than 5MB");
        return;
      }

      setFormData((prev) => ({ ...prev, thumbnail: file }));
    } else {
      setFormData((prev) => ({ ...prev, thumbnail: undefined }));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (formData.feedItemType === FeedItemType.VIDEO) {
        handleVideoFileChange(e.dataTransfer.files[0]);
      } else if (formData.feedItemType === FeedItemType.IMAGE_SLIDE) {
        handleImagesChange(e.dataTransfer.files);
      }
    }
  };

  const addHashTag = () => {
    if (hashTagInput.trim() && !formData.hashTags?.includes(hashTagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        hashTags: [...(prev.hashTags || []), hashTagInput.trim()],
      }));
      setHashTagInput("");
    }
  };

  const removeHashTag = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      hashTags: prev.hashTags?.filter((t) => t !== tag),
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Upload Feed Item</DialogTitle>
          <DialogDescription>
            Upload a new feed item to the platform. Choose the type and fill in the details.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            {/* Feed Item Type */}
            <div className="space-y-2">
              <Label htmlFor="feedItemType">Feed Item Type *</Label>
              <Select
                value={formData.feedItemType}
                onValueChange={(value) => {
                  setFormData((prev) => ({ 
                    ...prev, 
                    feedItemType: value as FeedItemType,
                    videoFile: undefined,
                    images: undefined,
                    duration: undefined,
                    captions: undefined,
                  }));
                }}
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={FeedItemType.VIDEO}>Video</SelectItem>
                  <SelectItem value={FeedItemType.IMAGE_SLIDE}>Image Slide</SelectItem>
                  <SelectItem value={FeedItemType.USER_DETAIL}>User Detail</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* File Upload Section */}
            {formData.feedItemType === FeedItemType.VIDEO && (
              <div className="space-y-2">
                <Label htmlFor="videoFile">Video File *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.videoFile ? (
                    <div className="space-y-2">
                      <FileVideo className="h-8 w-8 mx-auto text-primary" />
                      <p className="text-sm font-medium">{formData.videoFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(formData.videoFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleVideoFileChange(null)}
                      >
                        Remove File
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm">Drop video file here or click to select</p>
                      <p className="text-xs text-muted-foreground">Max file size: 100MB</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "video/*";
                          input.onchange = (e) => {
                            const file = (e.target as HTMLInputElement).files?.[0];
                            if (file) handleVideoFileChange(file);
                          };
                          input.click();
                        }}
                      >
                        Select Video
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {formData.feedItemType === FeedItemType.IMAGE_SLIDE && (
              <div className="space-y-2">
                <Label htmlFor="images">Images *</Label>
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-muted-foreground/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  {formData.images && formData.images.length > 0 ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-3 gap-2">
                        {formData.images.map((img, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square rounded border bg-muted flex items-center justify-center">
                              <ImageIcon className="h-6 w-6 text-muted-foreground" />
                            </div>
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute -top-2 -right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => removeImage(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <p className="text-xs mt-1 truncate">{img.name}</p>
                          </div>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files) handleImagesChange(files);
                          };
                          input.click();
                        }}
                      >
                        Add More Images
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ImageIcon className="h-8 w-8 mx-auto text-muted-foreground" />
                      <p className="text-sm">Drop images here or click to select</p>
                      <p className="text-xs text-muted-foreground">Max 10MB per image</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = "image/*";
                          input.multiple = true;
                          input.onchange = (e) => {
                            const files = (e.target as HTMLInputElement).files;
                            if (files) handleImagesChange(files);
                          };
                          input.click();
                        }}
                      >
                        Select Images
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="Enter title"
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Enter description"
                disabled={loading}
                rows={3}
              />
            </div>

            {/* Hashtags */}
            <div className="space-y-2">
              <Label htmlFor="hashtags">Hashtags</Label>
              <div className="flex gap-2">
                <Input
                  id="hashtags"
                  value={hashTagInput}
                  onChange={(e) => setHashTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addHashTag();
                    }
                  }}
                  placeholder="Add hashtag (press Enter)"
                  disabled={loading}
                />
                <Button type="button" onClick={addHashTag} disabled={loading}>
                  Add
                </Button>
              </div>
              {formData.hashTags && formData.hashTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.hashTags.map((tag) => (
                    <div
                      key={tag}
                      className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm flex items-center gap-2"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeHashTag(tag)}
                        className="hover:text-destructive"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Thumbnail (optional) */}
            <div className="space-y-2">
              <Label htmlFor="thumbnail">Thumbnail (Optional)</Label>
              <Input
                id="thumbnail"
                type="file"
                accept="image/*"
                onChange={(e) => handleThumbnailChange(e.target.files?.[0] || null)}
                disabled={loading}
              />
              {formData.thumbnail && (
                <p className="text-xs text-muted-foreground">
                  Selected: {formData.thumbnail.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={
                loading || 
                (formData.feedItemType === FeedItemType.VIDEO && !formData.videoFile) ||
                (formData.feedItemType === FeedItemType.IMAGE_SLIDE && (!formData.images || formData.images.length === 0))
              }
            >
              {loading ? "Uploading..." : "Upload Feed Item"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

