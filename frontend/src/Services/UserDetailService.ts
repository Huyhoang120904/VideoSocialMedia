import { api } from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { UserDetailResponse } from "../Types/UserDetailResponse";

const UserDetailService = {
  getMyDetails: async (): Promise<ApiResponse<UserDetailResponse>> => {
    const response = await api.get(`/user-details/me`);
    return response.data;
  },
};

export default UserDetailService;
