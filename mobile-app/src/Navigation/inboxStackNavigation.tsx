import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import InboxScreen from "../Srceens/Inbox";
import UserSearchScreen from "../Srceens/UserSearch";
import CreateGroupScreen from "../Srceens/CreateGroup";
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
        name="UserSearch"
        component={UserSearchScreen}
        options={{
          title: "Tìm kiếm người dùng",
        }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{
          title: "Tạo nhóm",
        }}
      />
    </Stack.Navigator>
  );
}
