// Request interfaces for ChatMessage API endpoints

export interface DirectChatMessageRequest {
  message: string;
  receiverId: string;
}

export interface ChatMessageRequest {
  message: string;
  conversationId: string;
}

export interface GroupChatMessageRequest {
  message: string;
  groupId: string;
}

export interface ChatMessageUpdateRequest {
  message: string;
}
