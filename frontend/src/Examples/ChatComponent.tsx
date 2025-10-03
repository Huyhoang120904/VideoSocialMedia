// Example usage of the simplified SocketService and SocketProvider

import React, { useEffect } from "react";
import { useSocket } from "../Context/SocketProvider";

const ChatComponent: React.FC = () => {
  const {
    isConnected,
    isConnecting,
    connectionError,
    subscribe,
    unsubscribe,
    send,
  } = useSocket();

  useEffect(() => {
    if (isConnected) {
      // Subscribe to chat messages
      subscribe("/chat/messages", (message) => {
        console.log("Received message:", message);
        // Handle incoming message
      });

      // Subscribe to user-specific messages
      subscribe("/user/notifications", (notification) => {
        console.log("Received notification:", notification);
        // Handle notification
      });

      // Cleanup subscriptions when component unmounts
      return () => {
        unsubscribe("/chat/messages");
        unsubscribe("/user/notifications");
      };
    }
  }, [isConnected, subscribe, unsubscribe]);

  const sendMessage = () => {
    if (isConnected) {
      send("/app/chat", {
        message: "Hello, World!",
        timestamp: new Date().toISOString(),
      });
    }
  };

  if (isConnecting) {
    return <div>Connecting to chat...</div>;
  }

  if (connectionError) {
    return <div>Connection error: {connectionError}</div>;
  }

  if (!isConnected) {
    return <div>Not connected to chat</div>;
  }

  return (
    <div>
      <div>Connected to chat!</div>
      <button onClick={sendMessage}>Send Message</button>
    </div>
  );
};

export default ChatComponent;
