import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Text, View } from "react-native";
import HomeScreen from "../Srceens/Home";

function ExploreScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Khám phá (Grid ảnh)</Text>
    </View>
  );
}

export default function TopVideo() {
  const TopTab = createMaterialTopTabNavigator();

  return (
    <TopTab.Navigator
      initialRouteName="Suggest"
      screenOptions={{
        tabBarShowLabel: true, // bật label để hiển thị
        tabBarStyle: { backgroundColor: "#000" },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          color: "#fff",
          textTransform: "none", // không viết hoa
        },
        tabBarIndicatorStyle: {
          backgroundColor: "#fff",
          height: 2,
        },
        swipeEnabled: true, // cho phép swipe ngang
      }}
    >
      <TopTab.Screen
        name="Suggest"
        component={HomeScreen}
        options={{ title: "Đề xuất" }}
      />
      <TopTab.Screen
        name="Friends"
        component={ExploreScreen}
        options={{ title: "Bạn bè" }}
      />
      <TopTab.Screen
        name="Follower"
        component={ExploreScreen}
        options={{ title: "Đã follow" }}
      />
      <TopTab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: "Khám phá" }}
      />
    </TopTab.Navigator>
  );
}
