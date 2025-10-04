import { api } from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import Page from "../Types/response/Page";
import { ConversationResponse } from "../Types/response/ConversationResponse";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { ConversationRequest } from "../Types/request/ConversationRequest";

interface PaginationParams {
  page?: number;
  size?: number;
}

const ConversationService = {
  // Get user's conversations with pagination support
  getMyConversations: async (
    params?: PaginationParams
  ): Promise<ApiResponse<Page<ConversationResponse>>> => {
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());

    const url = `/conversations/me${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
    const response = await api.get(url);
    return response.data;
  },

  // Legacy method for backward compatibility
  getMyConversation: async (): Promise<
    ApiResponse<Page<ConversationResponse>>
  > => {
    return ConversationService.getMyConversations();
  },

  // Create a new conversation
  createConversation: async (
    request: ConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.post("/conversations", request);
    return response.data;
  },

  // Update an existing conversation
  updateConversation: async (
    conversationId: string,
    request: ConversationRequest
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.put(`/conversations/${conversationId}`, request);
    return response.data;
  },

  // Add a member to a conversation
  addMemberToConversation: async (
    conversationId: string,
    participantId: string
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.post(
      `/conversations/${conversationId}/members/${participantId}`
    );
    return response.data;
  },

  // Remove a member from a conversation
  removeMemberFromConversation: async (
    conversationId: string,
    participantId: string
  ): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.delete(
      `/conversations/${conversationId}/members/${participantId}`
    );
    return response.data;
  },

  // Delete a conversation
  deleteConversation: async (
    conversationId: string
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete(`/conversations/${conversationId}`);
    return response.data;
  },

  // Get messages by conversation ID (existing method)
  getMessagesByConversationId: async (
    conversationId: string
  ): Promise<ApiResponse<Page<ChatMessageResponse>>> => {
    const response = await api.get(
      `/chat-messages/conversation/${conversationId}`
    );

    console.log(`/chat-messages/conversation/${conversationId}`);

    return response.data;
  },
};

export default ConversationService;
