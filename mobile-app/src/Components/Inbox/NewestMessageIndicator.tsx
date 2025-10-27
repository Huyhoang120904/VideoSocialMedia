import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNewestMessage } from "../../Context/NewestMessageProvider";

interface NewestMessageIndicatorProps {
  style?: any;
}

export default function NewestMessageIndicator({
  style,
}: NewestMessageIndicatorProps) {
  const { isConnected, onNewestMessage, offNewestMessage } = useNewestMessage();
  const [latestMessage, setLatestMessage] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);

  useEffect(() => {
    const handleNewestMessage = (broadcast: any) => {
      console.log("📢 Newest message indicator received:", broadcast);
      setLatestMessage(broadcast.message?.message || "New message");
      setMessageCount((prev) => prev + 1);
    };

    onNewestMessage(handleNewestMessage);

    return () => {
      offNewestMessage(handleNewestMessage);
    };
  }, [onNewestMessage, offNewestMessage]);

  if (!isConnected) {
    return (
      <View style={[styles.container, styles.disconnected, style]}>
        <Text style={styles.text}>📢 Newest Message: Disconnected</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, styles.connected, style]}>
      <Text style={styles.text}>
        📢 Newest Message: Connected
        {latestMessage && ` | Latest: ${latestMessage.substring(0, 20)}...`}
        {messageCount > 0 && ` | Count: ${messageCount}`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 8,
    borderRadius: 4,
    marginVertical: 4,
  },
  connected: {
    backgroundColor: "#4CAF50",
  },
  disconnected: {
    backgroundColor: "#F44336",
  },
  text: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
