import { api } from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import Page from "../Types/Page";
import { ConversationResponse } from "../Types/ConversationResponse";
import { ChatMessageResponse } from "../Types/ChatMessageResponse";

const ConversationService = {
  getMyConversation: async (): Promise<
    ApiResponse<Page<ConversationResponse>>
  > => {
    const response = await api.get(`/conversations/me`);
    return response.data;
  },
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
