
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import React from "react";
import Home from "../Srceens/Home";
import homeBottomTabNavigation from "./homeBottomTabNavigation";
import TopVideoScreen from "./topVideoTabNavigation"

export default function RootNavigation() {
    const Stack = createStackNavigator()

    return (
        <>
            <NavigationContainer>
                <Stack.Navigator screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="MainTabs" component={homeBottomTabNavigation}>

                    </Stack.Screen>

                    {/* Màn hình video chi tiết */}
                    {/* <Stack.Screen name="TopVideo" component={TopVideoScreen} /> */}
                </Stack.Navigator>
            </NavigationContainer>
        </>
    )
}
