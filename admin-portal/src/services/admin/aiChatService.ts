import apiClient from "@/config/axios";
import { ApiResponse, FileResponse } from "@/types";
import { ChatMessageResponse } from "./chatMessageService";

export interface AiChatMessageRequest {
  message: string;
}

export interface ConversationParticipantResponse {
  id: string;
  displayName?: string;
  shownName?: string;
  username?: string;
  avatar?: FileResponse;
  user?: {
    id: string;
    username: string;
  };
}

export interface ConversationResponse {
  conversationId: string;
  conversationName?: string;
  conversationType?: string;
  participantIds?: string[];
  userDetails?: ConversationParticipantResponse[];
  newestChatMessage?: ChatMessageResponse;
}

class AiChatService {
  /**
   * Send a message to AI and receive a response
   * @param request AI chat message request
   */
  async sendMessage(
    request: AiChatMessageRequest
  ): Promise<ApiResponse<ChatMessageResponse>> {
    const response = await apiClient.post("/ai-chat/messages", request);
    return response.data;
  }

  /**
   * Get or create the AI conversation for the current authenticated user
   */
  async getConversation(): Promise<ApiResponse<ConversationResponse>> {
    const response = await apiClient.get("/ai-chat/conversation");
    return response.data;
  }
}

export const aiChatService = new AiChatService();

