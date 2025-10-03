import FileResponse from "./FileResponse";
export interface ConversationResponse {
  conversationId: string;
  avatar: FileResponse;
  conversationName: string;
  conversationType: string;
  links: string[];
}
