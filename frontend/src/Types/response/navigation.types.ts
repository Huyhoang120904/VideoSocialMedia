import { NavigatorScreenParams } from "@react-navigation/native";

// Define the type for the inbox stack navigation
export type InboxStackParamList = {
  InboxHome: undefined;
  UserSearch: {
    mode?: string;
    conversationId?: string;
  };
  CreateGroup: undefined;
};

// Define the type for the authenticated stack navigation
export type AuthedStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  TopVideo: { videoId: string };
  Conversation: {
    conversationId: string;
    conversationName?: string;
    avatar?: any;
    receiverId?: string;
  };
  ConversationOptions: {
    conversationId: string;
    conversationName?: string;
    avatar?: any;
    conversationType?: string;
  };
  ConversationMembers: {
    conversationId: string;
    conversationName?: string;
  };
  UserProfile: {
    userId: string;
    userDisplayName?: string;
  };
  Call: {
    callType: "video" | "voice";
    userId: string;
    userName: string;
    userAvatar?: string;
  };
};

// Define the type for the unauthenticated stack navigation
export type UnauthedStackParamList = {
  Login: undefined;
  Register: undefined;
};

// Define the type for the main navigation stack (root)
export type RootStackParamList = AuthedStackParamList & UnauthedStackParamList;

// Define the type for the bottom tab navigation
export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Create: undefined;
  Inbox: NavigatorScreenParams<InboxStackParamList>;
  Profile: undefined;
};
