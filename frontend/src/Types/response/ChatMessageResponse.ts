import FileResponse from "./FileResponse";

export interface ChatMessageResponse {
  id: string;
  message: string;
  sender: string;
  senderId: string;
  conversationId: string;
  createdAt: string;
  edited: boolean;
  avatar?: FileResponse;
  readParticipantsId?: string[];
  isReadByCurrentUser?: boolean;
  readCount?: number;
}
