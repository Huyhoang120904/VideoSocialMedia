import FileResponse from "./FileResponse";

export enum NotificationType {
  COMMENT = "COMMENT",
  LIKE = "LIKE",
  MESSAGE = "MESSAGE",
}

export interface NotificationActorResponse {
  id: string;
  displayName: string;
  shownName: string;
  avatar: FileResponse | null;
}

export interface NotificationResponse {
  id: string;
  notificationType: NotificationType;
  title: string;
  body: string;
  previewText: string | null;
  feedItemId: string | null;
  commentId: string | null;
  conversationId: string | null;
  messageId: string | null;
  read: boolean;
  createdAt: string; // ISO string
  readAt: string | null; // ISO string
  actor: NotificationActorResponse | null;
}
