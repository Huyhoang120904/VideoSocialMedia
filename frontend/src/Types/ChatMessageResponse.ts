import FileResponse from "./FileResponse";

export interface ChatMessageResponse {
  id: string;
  message: string;
  sender: string;
  file: FileResponse;
  conversationId: string;
  time: String;

  read: boolean;
}
