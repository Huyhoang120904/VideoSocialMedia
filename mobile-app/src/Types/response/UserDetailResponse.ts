import FileResponse from "./FileResponse";
import { UserResponse } from "./UserResponse";

export interface UserDetailResponse {
  id: string;
  user: UserResponse;

  avatar?: FileResponse;
  displayName?: string;
  bio?: string;
  shownName?: string;

  following?: UserDetailResponse[];
  followingCount: number;

  follower?: UserDetailResponse[];
  followerCount: number;
}
