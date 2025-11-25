import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import FeedItemResponse from "../Types/response/FeedItemResponse";
import { UserDetailResponse } from "../Types/response/UserDetailResponse";

export interface SearchResultResponse {
  users: UserDetailResponse[];
  posts: FeedItemResponse[];
}

export const searchAll = async (
  keyword: string
): Promise<ApiResponse<SearchResultResponse>> => {
  try {
    const { data } = await api.get<ApiResponse<SearchResultResponse>>(
      "/search",
      {
        params: {
          keyword: keyword.trim(),
        },
      }
    );

    return data;
  } catch (error: any) {
    console.error("Search API Error:", error);
    throw error;
  }
};

export const getSearchHistory = async (): Promise<ApiResponse<string[]>> => {
  const { data } = await api.get<ApiResponse<string[]>>("/search/history");
  return data;
};

export const deleteSearchHistory = async (query?: string): Promise<ApiResponse<void>> => {
  const { data } = await api.delete<ApiResponse<void>>("/search/history", {
    params: { query },
  });
  return data;
};

export const getSuggestions = async (): Promise<ApiResponse<FeedItemResponse[]>> => {
  const { data } = await api.get<ApiResponse<FeedItemResponse[]>>("/search/suggestions");
  return data;
};

