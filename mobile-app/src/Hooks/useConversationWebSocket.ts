import { useEffect } from "react";
import { useSocket } from "../Context/SocketProvider";
import { ChatMessageResponse } from "../Types/response/ChatMessageResponse";

interface UseConversationWebSocketProps {
  conversationId: string;
  isAiConversation: boolean;
  onMessageReceived: (message: ChatMessageResponse) => void;
}

export const useConversationWebSocket = ({
  conversationId,
  isAiConversation,
  onMessageReceived,
}: UseConversationWebSocketProps) => {
  const { isConnected, subscribe, unsubscribe, connect } = useSocket();

  useEffect(() => {
    if (!isConnected) {
      connect().catch((error) =>
        console.warn("WebSocket connection attempt failed:", error?.message)
      );
    }
  }, [isConnected, connect]);

  useEffect(() => {
    console.log(`converastionId`, conversationId);

    if (isConnected && conversationId) {
      console.log(
        "🔔 Setting up WebSocket subscription for conversation:",
        conversationId
      );

      subscribe("/user/queue/chat", (receivedMessage: ChatMessageResponse) => {
        console.log("📨 Received real-time chat message:", receivedMessage);

        if (isAiConversation) {
          console.log(
            "🤖 AI conversation detected, skipping WebSocket message to prevent duplication"
          );
          return;
        }

        if (receivedMessage.conversationId === conversationId) {
          console.log(
            "✅ Message belongs to current conversation, adding to messages"
          );
          onMessageReceived(receivedMessage);
        } else {
          console.log("ℹ️ Message belongs to different conversation, ignoring");
        }
      });

      return () => {
        console.log(
          "🔕 Unsubscribing from WebSocket for conversation:",
          conversationId
        );
        unsubscribe("/user/queue/chat");
      };
    } else {
      console.log("⚠️ WebSocket not connected or no conversation ID");
    }
  }, [
    isConnected,
    conversationId,
    isAiConversation,
    subscribe,
    unsubscribe,
    onMessageReceived,
  ]);
};
