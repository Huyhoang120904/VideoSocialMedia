import FileResponse from "./FileResponse";

export enum FeedItemType {
  VIDEO = "VIDEO",
  IMAGE_SLIDE = "IMAGE_SLIDE",
}

export default interface FeedItemResponse {
  id: string;
  feedItemType: FeedItemType;
  video: FileResponse | null;
  hashTagIds?: string[];
  commentIds?: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}
