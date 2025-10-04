import { NavigatorScreenParams } from "@react-navigation/native";

// Define the type for the inbox stack navigation
export type InboxStackParamList = {
  InboxHome: undefined;
  Conversation: {
    conversationId: string;
    conversationName?: string;
    avatar?: any;
  };
  UserSearch: undefined;
};

// Define the type for the authenticated stack navigation
export type AuthedStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  TopVideo: { videoId: string };
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
