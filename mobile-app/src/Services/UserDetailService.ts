import { api } from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { UserDetailResponse } from "../Types/response/UserDetailResponse";
import { UserDetailUpdateParams } from "../Types/request/UserDetailRequest";
import { createUserDetailUpdateFormData } from "../Utils/FormDataHelper";

const UserDetailService = {
  // READ - Get current user's detail
  getMyDetails: async (): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await api.get(`/user-details/me`);
    return response.data;
  },

  // READ - Get user detail by ID
  getUserDetailById: async (
    userDetailId: string
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await api.get(`/user-details/${userDetailId}`);
    return response.data;
  },

  // READ - Get user detail by User ID
  getUserDetailByUserId: async (
    userId: string
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await api.get(`/user-details/by-user/${userId}`);
    return response.data;
  },

  // READ - Get all user details
  getAllUserDetails: async (): Promise<ApiResponse<UserDetailResponse[]>> => {
    const response = await api.get(`/user-details`);
    return response.data;
  },

  // READ - Get paginated user details
  getUserDetailsPaginated: async (
    page: number = 0,
    size: number = 10,
    sortBy: string = "displayName",
    sortDir: string = "asc"
  ): Promise<ApiResponse<any>> => {
    const response = await api.get(`/user-details/paginated`, {
      params: { page, size, sortBy, sortDir },
    });
    return response.data;
  },

  // READ - Search user details by display name
  searchByDisplayName: async (
    displayName: string
  ): Promise<ApiResponse<UserDetailResponse[]>> => {
    const response = await api.get(`/user-details/search/display-name`, {
      params: { displayName },
    });
    return response.data;
  },

  // READ - Search user details by username
  searchByUsername: async (
    username: string
  ): Promise<ApiResponse<UserDetailResponse[]>> => {
    const response = await api.get(`/user-details/search/username`, {
      params: { username },
    });
    return response.data;
  },

  // UPDATE - Update user detail (using FormData directly)
  updateUserDetail: async (
    userDetailId: string,
    formData: FormData
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await api.put(`/user-details/${userDetailId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  // UPDATE - Update user detail (using parameters - convenient wrapper)
  updateUserDetailWithParams: async (
    userDetailId: string,
    params: UserDetailUpdateParams
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const formData = createUserDetailUpdateFormData(params);
    return UserDetailService.updateUserDetail(userDetailId, formData);
  },

  // UPDATE - Update avatar only
  updateAvatar: async (
    userDetailId: string,
    avatarFile: any
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const formData = new FormData();
    formData.append("avatar", avatarFile);

    const response = await api.patch(
      `/user-details/${userDetailId}/avatar`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // DELETE - Delete user detail
  deleteUserDetail: async (
    userDetailId: string
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/user-details/${userDetailId}`);
    return response.data;
  },

  // SOCIAL - Follow a user
  followUser: async (
    targetUserDetailId: string
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await api.post(
      `/user-details/follow/${targetUserDetailId}`
    );
    return response.data;
  },

  // SOCIAL - Unfollow a user
  unfollowUser: async (
    targetUserDetailId: string
  ): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await api.delete(
      `/user-details/unfollow/${targetUserDetailId}`
    );
    return response.data;
  },

  // SOCIAL - Get followers
  getFollowers: async (
    userDetailId: string
  ): Promise<ApiResponse<UserDetailResponse[]>> => {
    const response = await api.get(`/user-details/${userDetailId}/followers`);
    return response.data;
  },

  // SOCIAL - Get following
  getFollowing: async (
    userDetailId: string
  ): Promise<ApiResponse<UserDetailResponse[]>> => {
    const response = await api.get(`/user-details/${userDetailId}/following`);
    return response.data;
  },

  // SOCIAL - Check if following
  isFollowing: async (
    userDetailId: string,
    targetUserDetailId: string
  ): Promise<ApiResponse<boolean>> => {
    const response = await api.get(
      `/user-details/${userDetailId}/is-following/${targetUserDetailId}`
    );
    return response.data;
  },
};

export default UserDetailService;
