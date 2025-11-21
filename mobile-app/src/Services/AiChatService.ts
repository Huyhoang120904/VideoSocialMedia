import { api } from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";
import { ConversationResponse } from "../Types/response/ConversationResponse";

/**
 * Request DTO for AI chat messages.
 */
export interface AiChatMessageRequest {
  message: string;
}

const AiChatService = {
  /**
   * Send a message to AI and receive a response.
   * POST /ai-chat/messages
   */
  sendMessage: async (
    request: AiChatMessageRequest
  ): Promise<ApiResponse<ChatMessageResponse>> => {
    const response = await api.post("/ai-chat/messages", request);
    return response.data;
  },

  /**
   * Get or create the AI conversation for the current authenticated user.
   * GET /ai-chat/conversation
   */
  getConversation: async (): Promise<ApiResponse<ConversationResponse>> => {
    const response = await api.get("/ai-chat/conversation");
    return response.data;
  },
};

export default AiChatService;

