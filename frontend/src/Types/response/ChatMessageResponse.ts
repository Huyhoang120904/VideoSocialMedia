export interface ChatMessageResponse {
  id: string;
  message: string;
  sender: string;
  conversationId: string;
  time: string;
  edited: boolean;
}
