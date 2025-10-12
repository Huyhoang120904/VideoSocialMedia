import FileResponse from "./FileResponse";
import { UserDetailResponse } from "./UserDetailResponse";

export interface ConversationResponse {
  conversationId: string;
  avatar: FileResponse;
  conversationName: string;
  conversationType: string;
  links: string[];
  userDetails: UserDetailResponse[];
  participantIds: string[];
  creatorId: string;
  newestChatMessage?: any;
}
