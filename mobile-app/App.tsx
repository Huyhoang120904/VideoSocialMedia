import React, { useEffect, useState, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "./src/Store/index";
import Navigation from "./src/Navigation";
import * as Font from "expo-font";
import { setCustomText } from "react-native-global-props";
import { StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
import { registerForPushNotificationsAsync } from "./src/Utils/NotificationHelper";

// import "./src/Navigation/global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Register from "./src/Srceens/Register";

export default function App() {
  const [loaded, setLoaded] = useState<boolean>(false);
  const notificationListener = useRef<Notifications.Subscription | null>(null);
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    (async () => {
      await Font.loadAsync({
        "TikTokSans-Regular": require("./assets/fonts/TikTokSans-Regular.ttf"),
        "TikTokSans-Bold": require("./assets/fonts/TikTokSans-Bold.ttf"),
        "TikTokSans-SemiBold": require("./assets/fonts/TikTokSans-SemiBold.ttf"),
      });

      setCustomText({
        style: {
          fontFamily: "TikTokSans-Regular",
        },
      });

      // Request notification permissions
      await registerForPushNotificationsAsync();

      setLoaded(true);
    })();
  }, []);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current =
      Notifications.addNotificationReceivedListener((notification) => {
        console.log("📬 Notification received in foreground:", notification);
      });

    // Listener for when user taps on a notification
    responseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        console.log("👆 Notification tapped:", response);
        const data = response.notification.request.content.data;
        // Navigation will be handled by the navigation system
        // You can dispatch navigation actions here if needed
      });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, []);

  if (!loaded) return null;

  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <Navigation />
      </SafeAreaProvider>
    </Provider>
  );
}
