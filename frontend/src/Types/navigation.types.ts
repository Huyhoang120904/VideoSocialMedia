import { NavigatorScreenParams } from "@react-navigation/native";

// Define the type for the main navigation stack
export type RootStackParamList = {
  MainTabs: NavigatorScreenParams<MainTabParamList>;
  TopVideo: { videoId: string };
  Conversation: { userId: string; username: string; avatar: any };
  Login: undefined;
  Register: undefined;
};

// Define the type for the bottom tab navigation
export type MainTabParamList = {
  Home: undefined;
  Discover: undefined;
  Create: undefined;
  Inbox: undefined;
  Profile: undefined;
};
