export interface ConversationRequest {
  participantIds: string[];
  avatarId?: string;
  conversationName?: string;
  conversationType: "DIRECT" | "GROUP";
  creatorId?: string;
}
