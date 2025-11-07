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
        feedItemType: 'VIDEO' | 'IMAGE_SLIDE',
        content: string
    ): Promise<{ id: string }> {
        const response = await api.post(
            `/feed/${feedItemId}/comment`,
            null,
            {
                params: {
                    feedItemType,
                    content,
                },
            }
        );
        // Backend wraps response in { code, result, message }
        return response.data.result || response.data;
    }

    async getComments(
        feedItemId: string,
        feedItemType: 'VIDEO' | 'IMAGE_SLIDE',
        currentUserId?: string,
        page: number = 0,
        size: number = 20
    ): Promise<CommentPageResponse> {
        const response = await api.get(
            `/feed/${feedItemId}/comments`,
            {
                params: {
                    feedItemType,
                    currentUserId,
                    page,
                    size,
                },
            }
        );
        // Backend wraps response in { code, result, message }
        return response.data.result || response.data;
    }

    async toggleCommentLike(
        commentId: string,
        userDetailId: string
    ): Promise<number> {
        const response = await api.post(
            `/feed/comment/${commentId}/like`,
            null,
            {
                params: {
                    userDetailId,
                },
            }
        );
        // Backend wraps response in { code, result, message }
        return response.data.result || response.data;
    }

    async addReply(
        commentId: string,
        content: string
    ): Promise<{ id: string }> {
        const response = await api.post(
            `/feed/comment/${commentId}/reply`,
            null,
            {
                params: {
                    content,
                },
            }
        );
        // Backend wraps response in { code, result, message }
        return response.data.result || response.data;
    }

    async getReplies(
        commentId: string,
        page: number = 0,
        size: number = 20
    ): Promise<CommentPageResponse> {
        const response = await api.get(
            `/feed/comment/${commentId}/replies`,
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
}

export default new CommentService();

