import apiClient from "@/config/axios";
import { ApiResponse, PagedResponse } from "@/types";

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

export interface ChatMessageResponse {
  id: string;
  content: string;
  senderId: string;
  senderName?: string;
  messageType: string;
  createdAt: string;
}

export interface ConversationRequest {
  name?: string;
  type: string;
  participantIds: string[];
}

class ConversationService {
  async getConversations(
    page: number = 0,
    size: number = 20
  ): Promise<ApiResponse<PagedResponse<ConversationResponse>>> {
    const response = await apiClient.get(
      `/conversations/me?page=${page}&size=${size}`
    );
    return response.data;
  }

  async getConversationById(
    id: string
  ): Promise<ApiResponse<ConversationResponse>> {
    const response = await apiClient.get(`/conversations/${id}`);
    return response.data;
  }

  async createConversation(
    request: ConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> {
    const response = await apiClient.post("/conversations", request);
    return response.data;
  }

  async updateConversation(
    id: string,
    request: ConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> {
    const response = await apiClient.put(`/conversations/${id}`, request);
    return response.data;
  }

  async deleteConversation(id: string): Promise<ApiResponse<void>> {
    const response = await apiClient.delete(`/conversations/${id}`);
    return response.data;
  }
}

export const conversationService = new ConversationService();

