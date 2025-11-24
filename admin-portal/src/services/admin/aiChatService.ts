import apiClient from "@/config/axios";
import { ApiResponse } from "@/types";

export interface AiChatMessageRequest {
  message: string;
}

export interface ChatMessageResponse {
  id: string;
  content: string;
  conversationId: string;
  senderId: string;
  senderName?: string;
  messageType: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  id: string;
  name?: string;
  type: string;
  participants: ParticipantResponse[];
  lastMessage?: ChatMessageResponse;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipantResponse {
  id: string;
  username: string;
  avatar?: string;
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

