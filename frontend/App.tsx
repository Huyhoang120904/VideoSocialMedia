import React, { useEffect, useState } from "react";
import { Provider } from "react-redux";
import { store } from "./src/store";
import Navigation from "./src/Navigation";
import * as Font from "expo-font";
import { setCustomText } from "react-native-global-props";
import { Text, View } from "react-native";

export default function App() {
  const [loaded, setLoaded] = useState(false);

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
      <Navigation />
    </Provider>
  );
}
