export interface ChatMessageResponse {
  id: string;
  message: string;
  sender: string;
  conversationId: string;
  createdAt: string;
  edited: boolean;
}
