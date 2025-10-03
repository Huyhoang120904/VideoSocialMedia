import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./src/Store/index";
import Navigation from "./src/Navigation";
import * as Font from "expo-font";
import { setCustomText } from "react-native-global-props";
import { StyleSheet, Text, View } from "react-native";

// import "./src/Navigation/global.css";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Register from "./src/Srceens/Register";

export default function App() {
  const [loaded, setLoaded] = useState<boolean>(false);

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

      setLoaded(true);
    })();
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
