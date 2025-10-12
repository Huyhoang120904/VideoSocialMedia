import { api, getAuthToken } from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import Page from "../Types/response/Page";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { 
  DirectChatMessageRequest, 
  GroupChatMessageRequest,
  ChatMessageUpdateRequest 
} from "../Types/request";

interface PaginationParams {
  page?: number;
  size?: number;
}

const ChatMessageService = {
  /**
   * Get all chat messages for a conversation with pagination
   * GET /chat-messages/conversation/{conversationId}
   */
  getMessagesByConversationId: async (
    conversationId: string,
    params?: PaginationParams
  ): Promise<ApiResponse<Page<ChatMessageResponse>>> => {

    
    const queryParams = new URLSearchParams();
    if (params?.page !== undefined)
      queryParams.append("page", params.page.toString());
    if (params?.size !== undefined)
      queryParams.append("size", params.size.toString());

    const url = `/chat-messages/conversation/${conversationId}${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;
    
    console.log("Fetching messages for conversation:", conversationId);
    console.log("Jwt token:", getAuthToken());
    const response = await api.get(url);
    return response.data;
  },

  /**
   * Create a new direct chat message
   * POST /chat-messages (with DirectChatMessageRequest)
   */
  createDirectChatMessage: async (
    request: DirectChatMessageRequest
  ): Promise<ApiResponse<ChatMessageResponse>> => {
    console.log("Creating direct chat message:", JSON.stringify(request, null, 2));
    const response = await api.post("/chat-messages", request);
    console.log("Direct chat message creation response:", response.data);
    return response.data;
  },

  /**
   * Create a new group chat message
   * POST /chat-messages/group (with GroupChatMessageRequest)
   */
  createGroupChatMessage: async (
    request: GroupChatMessageRequest
  ): Promise<ApiResponse<ChatMessageResponse>> => {
    console.log("Creating group chat message:", JSON.stringify(request, null, 2));
    const response = await api.post("/chat-messages/group", request);
    console.log("Group chat message creation response:", response.data);
    return response.data;
  },

  /**
   * Update an existing chat message
   * PUT /chat-messages/{messageId}
   */
  updateChatMessage: async (
    messageId: string,
    request: ChatMessageUpdateRequest
  ): Promise<ApiResponse<ChatMessageResponse>> => {
    console.log("Updating chat message:", messageId, request);
    const response = await api.put(`/chat-messages/${messageId}`, request);
    console.log("Chat message update response:", response.data);
    return response.data;
  },

  /**
   * Delete a chat message
   * DELETE /chat-messages/{messageId}
   */
  deleteChatMessage: async (
    messageId: string
  ): Promise<ApiResponse<void>> => {
    console.log("Deleting chat message:", messageId);
    const response = await api.delete(`/chat-messages/${messageId}`);
    console.log("Chat message deletion response:", response.data);
    return response.data;
  },

  /**
   * Send a direct message (convenience method)
   * This creates a message and handles conversation creation automatically
   */
  sendDirectMessage: async (
    receiverId: string,
    message: string
  ): Promise<ApiResponse<ChatMessageResponse>> => {
    const request: DirectChatMessageRequest = {
      message,
      receiverId,
    };

    return ChatMessageService.createDirectChatMessage(request);
  },

  /**
   * Send a message to an existing conversation (for direct messages)
   * This method finds the other participant and sends a direct message
   * The backend will find the existing conversation by participant hash
   */
  sendMessageToDirectConversation: async (
    conversationId: string,
    message: string,
    currentUserId: string,
    participantIds: string[]
  ): Promise<ApiResponse<ChatMessageResponse>> => {
    // Find the other participant (not the current user)
    const receiverId = participantIds.find(id => id !== currentUserId);
    
    if (!receiverId) {
      throw new Error("No other participant found in conversation");
    }

    // Use the direct message endpoint - the backend will find the existing conversation
    // by creating a hash of the participants and looking it up
    return ChatMessageService.sendDirectMessage(receiverId, message);
  },

  /**
   * Send a message to an existing group conversation
   * This method sends a group message directly to the conversation
   */
  sendMessageToGroupConversation: async (
    groupId: string,
    message: string
  ): Promise<ApiResponse<ChatMessageResponse>> => {
    const request: GroupChatMessageRequest = {
      message,
      groupId,
    };

    return ChatMessageService.createGroupChatMessage(request);
  },
};

export default ChatMessageService;
