import FileResponse from "./FileResponse";
import { UserResponse } from "./UserResponse";

export interface UserDetailResponse {
  id: string;
  userId: string;

  avatar?: FileResponse;
  displayName?: string;
  bio?: string;
  shownName?: string;

  user?: UserResponse;

  following?: UserDetailResponse[];
  followingCount: number;

  follower?: UserDetailResponse[];
  followerCount: number;
}
