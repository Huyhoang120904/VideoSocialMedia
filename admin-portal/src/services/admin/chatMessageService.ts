import apiClient from "@/config/axios";
import { ApiResponse, FileResponse, PagedResponse } from "@/types";

export type ChatMessageType = "SHARED_VIDEO" | "TEXT" | "VIDEO" | "IMAGE";

export interface ChatMessageResponse {
  id: string;
  conversationId: string;
  sender: string;
  senderId: string;
  message?: string;
  messageType: ChatMessageType;
  createdAt: string;
  edited: boolean;
  avatar?: FileResponse;
  readParticipantsId?: string[];
  isReadByCurrentUser?: boolean;
  readCount?: number;
  file?: FileResponse;
  feedItemId?: string;
}

export interface ChatMessageUpdateRequest {
  message: string;
}

class ChatMessageService {
  async getChatMessagesByConversation(
    conversationId: string,
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<ChatMessageResponse>>> {
    const response = await apiClient.get(
      `/chat-messages/conversation/${conversationId}?page=${page}&size=${size}&sort=createdAt,desc`
    );
    return response.data;
  }

  async updateMessage(
    messageId: string,
    request: ChatMessageUpdateRequest
  ): Promise<ApiResponse<ChatMessageResponse>> {
    const response = await apiClient.put(`/chat-messages/${messageId}`, request);
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/chat-messages/${messageId}`);
    return response.data;
  }

  async markMessageAsRead(
    messageId: string
  ): Promise<ApiResponse<ChatMessageResponse>> {
    const response = await apiClient.post(`/chat-messages/${messageId}/read`);
    return response.data;
  }

  async markConversationAsRead(
    conversationId: string
  ): Promise<ApiResponse<void>> {
    const response = await apiClient.post(
      `/chat-messages/conversation/${conversationId}/read-all`
    );
    return response.data;
  }
}

export const chatMessageService = new ChatMessageService();

