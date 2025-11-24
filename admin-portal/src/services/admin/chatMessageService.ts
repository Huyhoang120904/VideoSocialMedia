import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

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

export interface ChatMessageUpdateRequest {
  content: string;
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

