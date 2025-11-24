import { api } from './HttpClient';

export interface Comment {
    id: string;
    content: string;
    type?: "TEXT" | "GIF";
    likeCount: number;
    username: string;
    avatarUrl?: string;
    createdAt: string;
    updatedAt: string;
    isLikedByCurrentUser?: boolean;  // Add this field from backend
    timeAgo?: string;  // Thời gian đã format từ backend: "vừa xong", "3 phút trước", "25/7"
    replyCount?: number;  // Số lượng replies của comment
    parentCommentId?: string; // ID của comment cha (nếu có)
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
        content: string,
        parentCommentId?: string,
        type: "TEXT" | "GIF" = "TEXT"
    ): Promise<CommentCreateResponse> {
        const response = await api.post(
            `/feed-items/${feedItemId}/comments`,
            {
                content,
                type,
                ...(parentCommentId && { parentCommentId })
            }
        );
        // Backend wraps response in { code, result, message }
        return response.data.result || response.data;
    }

    /**
     * Reply to a comment
     * @param feedItemId - ID of the feed item
     * @param parentCommentId - ID of the parent comment to reply to
     * @param content - Reply content
     * @returns CommentCreateResponse
     */
    async replyComment(
        feedItemId: string,
        parentCommentId: string,
        content: string,
        type: "TEXT" | "GIF" = "TEXT"
    ): Promise<CommentCreateResponse> {
        return this.addComment(feedItemId, content, parentCommentId, type);
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

    /**
     * Get replies of a comment
     * @param commentId - ID of the parent comment
     * @param page - Page number (default: 0)
     * @param size - Page size (default: 20)
     * @returns CommentPageResponse
     */
    async getReplies(
        commentId: string,
        page: number = 0,
        size: number = 20
    ): Promise<CommentPageResponse> {
        const response = await api.get(
            `/feed-items/comments/${commentId}/replies`,
            {
                params: {
                    page,
                    size,
                },
            }
        );
        return response.data.result || response.data;
    }
}

export default new CommentService();

