// Request interfaces for ChatMessage API endpoints
import { ChatMessageType } from "../common/ChatMessageType";

export interface DirectChatMessageRequest {
  message?: string;
  receiverId: string;
  messageType: ChatMessageType;
  fileId?: string;
}

export interface ChatMessageRequest {
  message: string;
  conversationId: string;
}

export interface GroupChatMessageRequest {
  message?: string;
  groupId: string;
  messageType: ChatMessageType;
  fileId?: string;
}

export interface ChatMessageUpdateRequest {
  message: string;
}
