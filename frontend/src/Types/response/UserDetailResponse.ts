import FileResponse from "./FileResponse";

export interface UserDetailResponse {
  id: string;

  avatar?: FileResponse;
  displayName?: string;
  bio?: string;
  shownName?: string;

  following?: UserDetailResponse[];
  followingCount: number;

  follower?: UserDetailResponse[];
  followerCount: number;
}
