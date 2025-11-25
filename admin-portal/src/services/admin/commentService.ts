import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

export interface CommentResponse {
  id: string;
  feedItemId: string;
  userId: string;
  username?: string;
  content: string;
  likeCount: number;
  dislikeCount: number;
  isLiked: boolean;
  isDisliked: boolean;
  createdAt: string;
  updatedAt: string;
}

class CommentService {
  async getComments(
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<CommentResponse>>> {
    // Note: This endpoint might need to be created on the backend
    // For now, we'll use a placeholder endpoint
    const response = await apiClient.get(`/comments?page=${page}&size=${size}`);
    return response.data;
  }

  async getCommentsByFeedItem(
    feedItemId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<CommentResponse>>> {
    const response = await apiClient.get(
      `/feed-items/${feedItemId}/comments?page=${page}&size=${size}`
    );
    return response.data;
  }

  async deleteComment(commentId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/feed-items/comments/${commentId}`);
    return response.data;
  }
}

export const commentService = new CommentService();

