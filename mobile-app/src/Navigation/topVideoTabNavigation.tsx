import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { Text, View, TouchableOpacity, Alert } from "react-native";
import HomeScreen from "../Srceens/Home";
import { MaterialTopTabBarProps } from "@react-navigation/material-top-tabs";

function ExploreScreen() {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text>Khám phá (Grid ảnh)</Text>
    </View>
  );
}

// Custom Tab Bar với xử lý reload khi click tab active
function CustomTabBar({ state, descriptors, navigation }: MaterialTopTabBarProps) {
  return (
    <View style={{ flexDirection: "row", backgroundColor: "#000" }}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || route.name;
        const isFocused = state.index === index;

        const onPress = () => {
          Alert.alert("Debug", `Clicked ${label}, isFocused: ${isFocused}`);

          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            // Chuyển sang tab khác
            Alert.alert("Debug", `Switching to ${label}`);
            navigation.navigate(route.name);
          } else if (isFocused) {
            // Click vào tab đang active - trigger reload
            console.log(`🔄 Reloading ${route.name} tab`);
            Alert.alert("Debug", `Reloading ${label}`);
            // Emit custom event để screen có thể lắng nghe
            navigation.emit({
              type: "tabLongPress", // Sử dụng tabLongPress như một hack để trigger reload
              target: route.key,
            });
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{ flex: 1, paddingVertical: 12, alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 12,
                fontWeight: "600",
                color: "#fff",
              }}
            >
              {label}
            </Text>
            {isFocused && (
              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: "#fff",
                }}
              />
            )}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TopVideo() {
  const TopTab = createMaterialTopTabNavigator();

  return (
    <TopTab.Navigator
      initialRouteName="Suggest"
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        swipeEnabled: true, // cho phép swipe ngang
      }}
    >
      <TopTab.Screen
        name="Suggest"
        component={HomeScreen}
        options={{ title: "Đề xuất 1" }}
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
