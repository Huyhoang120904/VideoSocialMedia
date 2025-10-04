import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import InboxScreen from "../Srceens/Inbox";
import ConversationScreen from "../Srceens/Conversation";
import UserSearchScreen from "../Srceens/UserSearch";
import { InboxStackParamList } from "../Types/response/navigation.types";

const Stack = createStackNavigator<InboxStackParamList>();

export default function InboxStackNavigation() {
  return (
    <Stack.Navigator
      initialRouteName="InboxHome"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen
        name="InboxHome"
        component={InboxScreen}
        options={{
          title: "Hộp thư",
        }}
      />
      <Stack.Screen
        name="Conversation"
        component={ConversationScreen}
        options={{
          title: "Cuộc trò chuyện",
        }}
      />
      <Stack.Screen
        name="UserSearch"
        component={UserSearchScreen}
        options={{
          title: "Tìm kiếm người dùng",
        }}
      />
    </Stack.Navigator>
  );
}
