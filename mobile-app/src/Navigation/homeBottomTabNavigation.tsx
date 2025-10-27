import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import HomeScreen from "../Srceens/Home";
import SearchScreen from "../Srceens/Search/index";
import UploadScreen from "../Srceens/Upload";
import InboxStackNavigation from "./inboxStackNavigation";
import ProfileScreen from "../Srceens/Profile";
import { Text, View } from "react-native";

const CreateButton = () => {
  return (
    <View
      style={{
        width: 48,
        height: 35,
        backgroundColor: "#fff",
        borderRadius: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Phần màu xanh bên trái */}
      <View
        style={{
          width: "8%",
          height: "100%",
          backgroundColor: "#28F",
          position: "absolute",
          left: 0,
          borderTopLeftRadius: 12,
          borderBottomLeftRadius: 12,
          borderTopRightRadius: 4,
          borderBottomRightRadius: 4,
        }}
      />

      {/* Phần màu đỏ bên phải */}
      <View
        style={{
          width: "8%",
          height: "100%",
          backgroundColor: "#FE2C55",
          position: "absolute",
          right: 0,
          borderTopRightRadius: 12,
          borderBottomRightRadius: 12,
          borderTopLeftRadius: 4,
          borderBottomLeftRadius: 4,
        }}
      />

      {/* Phần trắng ở giữa */}
      <View
        style={{
          width: "30%",
          height: "100%",
          backgroundColor: "#fff",
          position: "absolute",
          left: "35%",
          zIndex: 1,
        }}
      />

      {/* Icon dấu cộng */}
      <MaterialCommunityIcons
        name="plus"
        size={28}
        color="#000"
        style={{
          zIndex: 2,
        }}
      />
    </View>
  );
};

export default function HomeBottomTabNavigation() {
  const Tab = createBottomTabNavigator();

  return (
    <Tab.Navigator
      initialRouteName="Home" // mặc định khi mở app lên nhảy vào route này đầu tiên
      screenOptions={{
        tabBarStyle: { backgroundColor: "#000", borderTopWidth: 0 },
        tabBarActiveTintColor: "#fff",
        tabBarInactiveTintColor: "#888",
        tabBarLabelStyle: {
          fontFamily: "TikTokSans-Regular",
          fontSize: 8,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Trang chủ",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={25}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchScreen}
        options={{
          tabBarLabel: "Tìm kiếm",
          headerShown: false,
          tabBarIcon: ({ color }) => (
            <Ionicons name="search" size={25} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Create"
        component={UploadScreen}
        options={{
          tabBarLabel: "",
          headerShown: false,
          tabBarIcon: () => <CreateButton />,
        }}
      />
      <Tab.Screen
        name="Inbox"
        component={InboxStackNavigation}
        options={{
          tabBarLabel: "Hộp thư",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={
                focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"
              }
              size={25}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Hồ sơ",
          headerShown: false,
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person-circle" : "person-circle-outline"}
              size={25}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
