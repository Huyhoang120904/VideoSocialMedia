import FileResponse from "./FileResponse";
import { UserDetailResponse } from "./UserDetailResponse";

export enum FeedItemType {
  VIDEO = "VIDEO",
  IMAGE_SLIDE = "IMAGE_SLIDE",
}

export interface ImageSlideResponse {
  id: string;
  images: FileResponse[];
  createdAt: string;
  updatedAt: string;
}

export default interface FeedItemResponse {
  id: string;
  feedItemType: FeedItemType;
  video: FileResponse | null;
  imageSlide: ImageSlideResponse | null;
  title?: string;
  description?: string;
  hashTagIds?: string[];
  hashTags?: string[];
  commentIds?: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
  loved?: boolean;
  uploader?: UserDetailResponse; // Thông tin người upload
}
