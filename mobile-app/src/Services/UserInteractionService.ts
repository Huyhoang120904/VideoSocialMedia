import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";

export interface UserInteractionRequest {
    feedItemId: string;
    userDetailId: string;
    watchDuration: number; // in seconds
}

class UserInteractionService {
    /**
     * Lưu user interaction (thời gian xem video)
     * @param interactions - Danh sách các interaction cần lưu
     */
    async saveInteractions(
        interactions: UserInteractionRequest[]
    ): Promise<ApiResponse<void>> {
        try {
            // Validate input
            if (!interactions || interactions.length === 0) {
                console.warn("Empty interactions array provided");
                return { code: 1000, message: "Success" } as ApiResponse<void>;
            }

            // Filter out invalid interactions
            const validInteractions = interactions.filter(
                (interaction) =>
                    interaction &&
                    interaction.feedItemId &&
                    interaction.userDetailId &&
                    interaction.watchDuration != null &&
                    interaction.watchDuration > 0
            );

            if (validInteractions.length === 0) {
                console.warn("No valid interactions to save");
                return { code: 1000, message: "Success" } as ApiResponse<void>;
            }

            const response = await api.post<ApiResponse<void>>(
                "/user-interactions",
                validInteractions
            );
            return response.data;
        } catch (error: any) {
            console.error("Error saving user interactions:", error);
            if (error.response) {
                console.error("Response status:", error.response.status);
                console.error("Response data:", error.response.data);
            }
            // Don't throw error - fail silently to not interrupt user experience
            return { code: 9999, message: error.message || "Unknown error" } as ApiResponse<void>;
        }
    }

    /**
     * Lưu một interaction đơn lẻ
     * @param interaction - Interaction cần lưu
     */
    async saveInteraction(
        interaction: UserInteractionRequest
    ): Promise<ApiResponse<void>> {
        return this.saveInteractions([interaction]);
    }
}

export default new UserInteractionService();

