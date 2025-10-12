import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import HomeBottomTabNavigation from "./homeBottomTabNavigation";
import TopVideoScreen from "./topVideoTabNavigation";
import "./global.css";
import LoginScreen from "../Srceens/Login";
import RegisterScreen from "../Srceens/Register";
import ConversationScreen from "../Srceens/Conversation";
import ConversationOptionsScreen from "../Srceens/ConversationOptions";
import ConversationMembersScreen from "../Srceens/ConversationMembers";
import UserProfileScreen from "../Srceens/UserProfile";
import CallScreen from "../Srceens/Call";
import { AuthProvider, useAuth } from "../Context/AuthProvider";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ConversationProvider } from "../Context/ConversationProvider";
import { ChatMessageProvider } from "../Context/ChatMessageProvider";
import { SocketProvider } from "../Context/SocketProvider";

export default function RootNavigation() {
  const Stack = createStackNavigator();

  const Authed = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={HomeBottomTabNavigation} />
      <Stack.Screen name="TopVideo" component={TopVideoScreen} />
      <Stack.Screen name="Conversation" component={ConversationScreen} />
      <Stack.Screen
        name="ConversationOptions"
        component={ConversationOptionsScreen}
      />
      <Stack.Screen
        name="ConversationMembers"
        component={ConversationMembersScreen}
      />
      <Stack.Screen name="UserProfile" component={UserProfileScreen} />
      <Stack.Screen name="Call" component={CallScreen} />
    </Stack.Navigator>
  );

  const Unauthed = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );

  const Switcher = () => {
    const { isLoading, isAuthenticated } = useAuth();
    if (isLoading) return null;
    return isAuthenticated ? <Authed /> : <Unauthed />;
  };

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <SocketProvider>
          <ConversationProvider>
            <ChatMessageProvider>
              <NavigationContainer>
                <Switcher />
              </NavigationContainer>
            </ChatMessageProvider>
          </ConversationProvider>
        </SocketProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
