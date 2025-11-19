import { api } from "./HttpClient";

export interface LoveResponse {
    loved: boolean;
    loveCount: number;
}

export interface ApiResponse<T> {
    result: T;
    message: string;
}

export const LikeService = {
    /**
     * Thêm love cho feed item
     */
    addLove: async (feedItemId: string): Promise<LoveResponse> => {
        try {
            console.log(`[LikeService] ========== addLove called ==========`);
            console.log(`[LikeService] FeedItem ID:`, feedItemId);
            console.log(`[LikeService] ID type:`, typeof feedItemId);
            console.log(`[LikeService] ID length:`, feedItemId?.length);
            console.log(`[LikeService] Calling API: POST /feed-items/${feedItemId}/love`);

            const response = await api.post<ApiResponse<LoveResponse>>(
                `/feed-items/${feedItemId}/love`
            );

            console.log("[LikeService] ✅ Love added successfully:", response.data);
            return response.data.result;
        } catch (error: any) {
            console.error("[LikeService] ❌ Error adding love:", {
                feedItemId,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
            });
            throw error;
        }
    },

    /**
     * Xóa love khỏi feed item
     */
    removeLove: async (feedItemId: string): Promise<LoveResponse> => {
        try {
            console.log(`[LikeService] ========== removeLove called ==========`);
            console.log(`[LikeService] FeedItem ID:`, feedItemId);
            console.log(`[LikeService] Calling API: DELETE /feed-items/${feedItemId}/love`);

            const response = await api.delete<ApiResponse<LoveResponse>>(
                `/feed-items/${feedItemId}/love`
            );

            console.log("[LikeService] ✅ Love removed successfully:", response.data);
            return response.data.result;
        } catch (error: any) {
            console.error("[LikeService] ❌ Error removing love:", {
                feedItemId,
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
                url: error.config?.url,
            });
            throw error;
        }
    },

    /**
     * Kiểm tra trạng thái love
     */
    checkLoveStatus: async (feedItemId: string): Promise<LoveResponse> => {
        try {
            console.log(`[LikeService] Checking love status for feedItem: ${feedItemId}`);
            const response = await api.get<ApiResponse<LoveResponse>>(
                `/feed-items/${feedItemId}/love`
            );

            console.log("[LikeService] Love status checked:", response.data);
            return response.data.result;
        } catch (error: any) {
            console.error("[LikeService] Error checking love status:", {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });
            throw error;
        }
    },
};