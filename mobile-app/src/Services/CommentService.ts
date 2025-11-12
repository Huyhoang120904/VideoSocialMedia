import { api } from './HttpClient';

export interface Comment {
    id: string;
    content: string;
    likeCount: number;
    username: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    isLikedByCurrentUser?: boolean;  // Add this field from backend
    timeAgo?: string;  // Thời gian đã format từ backend: "vừa xong", "3 phút trước", "25/7"
}

export interface CommentCreateResponse {
    comment: Comment;
    totalComments: number;
}

export interface CommentActionResponse {
    liked: boolean;
    disliked: boolean;
    likeCount: number;
    dislikeCount: number;
}

export interface CommentPageResponse {
    content: Comment[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

class CommentService {
    async addComment(
        feedItemId: string,
        content: string
    ): Promise<CommentCreateResponse> {
        const response = await api.post(
            `/feed-items/${feedItemId}/comments`,
            { content }
        );
        // Backend wraps response in { code, result, message }
        return response.data.result || response.data;
    }

    async getComments(
        feedItemId: string,
        page: number = 0,
        size: number = 20
    ): Promise<CommentPageResponse> {
        const response = await api.get(
            `/feed-items/${feedItemId}/comments`,
            {
                params: {
                    page,
                    size,
                },
            }
        );
        // Backend wraps response in { code, result, message }
        return response.data.result || response.data;
    }

    /**
     * Like a comment
     * @param commentId - ID của comment cần like
     * @returns CommentActionResponse với trạng thái và số lượng likes mới
     */
    async likeComment(commentId: string): Promise<CommentActionResponse> {
        const response = await api.post(
            `/feed-items/comments/${commentId}/like`
        );
        return response.data.result || response.data;
    }

    /**
     * Unlike a comment
     * @param commentId - ID của comment cần unlike
     * @returns CommentActionResponse với trạng thái và số lượng likes mới
     */
    async unlikeComment(commentId: string): Promise<CommentActionResponse> {
        const response = await api.delete(
            `/feed-items/comments/${commentId}/like`
        );
        return response.data.result || response.data;
    }

    /**
     * Toggle like status of a comment (like nếu chưa like, unlike nếu đã like)
     * @param commentId - ID của comment
     * @param isCurrentlyLiked - Trạng thái like hiện tại
     * @returns CommentActionResponse với trạng thái và số lượng likes mới
     */
    async toggleCommentLike(
        commentId: string,
        isCurrentlyLiked: boolean
    ): Promise<CommentActionResponse> {
        if (isCurrentlyLiked) {
            return this.unlikeComment(commentId);
        } else {
            return this.likeComment(commentId);
        }
    }

    async removeComment(commentId: string): Promise<boolean> {
        const response = await api.delete(
            `/feed-items/comments/${commentId}`
        );
        return response.data.result || response.data;
    }
}

export default new CommentService();

