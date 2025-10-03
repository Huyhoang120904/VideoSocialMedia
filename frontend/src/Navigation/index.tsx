import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import HomeBottomTabNavigation from "./homeBottomTabNavigation";
import TopVideoScreen from "./topVideoTabNavigation";
import "./global.css";
import LoginScreen from "../Srceens/Login";
import RegisterScreen from "../Srceens/Register";
import { AuthProvider, useAuth } from "../Context/AuthProvider";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { ConversationProvider } from "../Context/ConversationProvider";
import { SocketProvider } from "../Context/SocketProvider";

export default function RootNavigation() {
  const Stack = createStackNavigator();

  const Authed = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={HomeBottomTabNavigation} />
      <Stack.Screen name="TopVideo" component={TopVideoScreen} />
      <Stack.Screen
        name="Conversation"
        component={require("../Srceens/Conversation").default}
      />
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
    <SafeAreaProvider >
      <AuthProvider>
        <ConversationProvider>
          <NavigationContainer>
            <SocketProvider>
              <Switcher />
            </SocketProvider>
          </NavigationContainer>
        </ConversationProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
