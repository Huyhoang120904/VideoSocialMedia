export type UploadType = "video" | "imageSlide";

export interface VideoData {
  uri: string;
  fileName?: string;
  duration?: number;
  width?: number;
  height?: number;
}

export interface ThumbnailData {
  uri: string;
  fileName?: string;
}

export interface ImageData {
  uri: string;
  fileName?: string;
  width?: number;
  height?: number;
}
