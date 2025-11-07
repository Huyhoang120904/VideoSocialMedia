import { api } from "./HttpClient";

export interface ToggleLikeResponse {
    result: number; // New like count
    message: string;
}

export const LikeService = {
    /**
     * Toggle like for a feed item (video or image slide)
     */
    toggleLike: async (
        feedItemId: string,
        feedItemType: "VIDEO" | "IMAGE_SLIDE",
        isLiked: boolean
    ): Promise<number> => {
        try {
            const response = await api.post<ToggleLikeResponse>(
                `/feed/${feedItemId}/like`,
                null,
                {
                    params: {
                        feedItemType: feedItemType,
                        isLiked: isLiked,
                    },
                }
            );

            console.log("Like toggled successfully:", response.data);
            return response.data.result;
        } catch (error) {
            console.error("Error toggling like:", error);
            throw error;
        }
    },
};