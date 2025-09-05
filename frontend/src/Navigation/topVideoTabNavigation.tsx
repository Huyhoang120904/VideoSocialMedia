import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Text, View } from "react-native";

function ExploreScreen() {
  return (
    <View>
      <Text>Khám phá</Text>
    </View>
  );
}

export default function TopVideo() {
  const TopTab = createMaterialTopTabNavigator();

  return (
    <TopTab.Navigator
      screenOptions={{
        tabBarLabelStyle: {
          fontFamily: "TikTokSans-Regular",
          fontSize: 10,
        },
        tabBarStyle: {
          backgroundColor: "#000",
        },
      }}
    >
      <TopTab.Screen
        name="Explore"
        component={ExploreScreen}
        options={{ title: "Khám phá" }}
      ></TopTab.Screen>
      <TopTab.Screen
        name="Friends"
        component={ExploreScreen}
        options={{ title: "Bạn bè" }}
      ></TopTab.Screen>
      <TopTab.Screen
        name="Follower"
        component={ExploreScreen}
        options={{ title: "Đã follow" }}
      ></TopTab.Screen>
      <TopTab.Screen
        name="Suggest"
        component={ExploreScreen}
        options={{ title: "Đề xuất" }}
      ></TopTab.Screen>
    </TopTab.Navigator>
  );
}
