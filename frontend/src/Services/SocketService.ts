import SockJS from "sockjs-client";
import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import { getAuthToken } from "./HttpClient";

export class SocketService {
  private stompClient: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();
  private messageQueue: Array<{ destination: string; body: any }> = [];
  private isConnecting: boolean = false;
  private currentToken: string | null = null;

  async connect(): Promise<void> {
    // Skip if already connected
    if (this.stompClient?.connected) return;

    // Skip if already connecting
    if (this.isConnecting) return;

    // Check for authentication token
    const token = getAuthToken();
    if (!token) throw new Error("No auth token available");

    // Check if token has changed (for reconnection scenarios)
    if (this.currentToken && this.currentToken !== token) {
      console.log("SocketService: Token changed, reconnecting...");
      this.disconnect();
    }

    this.currentToken = token;

    // Get WebSocket URL
    const baseUrl = process.env.EXPO_PUBLIC_WS_URL || "http://172.20.41.84:8081/ws-native";
    console.log("SocketService: Using WebSocket URL:", baseUrl);

    // Add auth token as query parameter
    const url = `${baseUrl}?token=${encodeURIComponent(token)}`;

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.isConnecting = false;
        reject(new Error("Connection timeout"));
      }, 10000);

      try {
        // Create STOMP client with SockJS
        this.stompClient = new Client({
          webSocketFactory: () => new SockJS(url) as any,
          debug: (str) => {
            // Only log important STOMP messages
            if (str.includes('CONNECTED') || str.includes('ERROR')) {
              console.log("STOMP:", str);
            }
          },
          onConnect: () => {
            clearTimeout(timeout);
            this.isConnecting = false;
            console.log("🔌 WebSocket connected");

            // Process any queued messages
            this.processMessageQueue();

            resolve();
          },
          onStompError: (frame) => {
            clearTimeout(timeout);
            this.isConnecting = false;
            console.error("❌ STOMP error:", frame);
            reject(new Error("STOMP connection failed"));
          },
          onWebSocketError: (error) => {
            clearTimeout(timeout);
            this.isConnecting = false;
            console.error("❌ WebSocket error:", error);
            reject(new Error("WebSocket connection failed"));
          },
          onWebSocketClose: () => {
            console.log("🔌 WebSocket disconnected");
            this.isConnecting = false;
          }
        });

        // Activate the STOMP client
        this.stompClient.activate();
      } catch (error) {
        clearTimeout(timeout);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (!this.stompClient) return;

    // Unsubscribe from all subscriptions
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
    this.messageQueue = [];
    
    this.stompClient.deactivate();
    this.stompClient = null;
    this.isConnecting = false;
    this.currentToken = null;
    console.log("SocketService: Disconnected");
  }

  isConnected(): boolean {
    return this.stompClient?.connected || false;
  }

  // Check if token has changed and reconnection is needed
  needsReconnection(): boolean {
    const currentToken = getAuthToken();
    return this.currentToken !== currentToken;
  }

  subscribe(destination: string, callback: (message: any) => void): void {
    if (!this.isConnected()) {
      console.error("❌ Cannot subscribe: WebSocket not connected");
      return;
    }
    
    // Subscribe using STOMP client
    const subscription = this.stompClient!.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        console.error("❌ Error parsing message:", error);
        callback(message.body);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log("🔔 Subscribed to:", destination);
  }

  unsubscribe(destination: string): void {
    if (this.subscriptions.has(destination)) {
      const subscription = this.subscriptions.get(destination);
      subscription?.unsubscribe();
      this.subscriptions.delete(destination);
      console.log("🔇 Unsubscribed from:", destination);
    }
  }

  send(destination: string, body: any): void {
    if (!this.isConnected()) {
      this.messageQueue.push({ destination, body });
      return;
    }

    try {
      this.stompClient!.publish({
        destination,
        body: JSON.stringify(body)
      });
    } catch (error) {
      console.error("❌ Error sending message:", error);
    }
  }


  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    messages.forEach(({ destination, body }) => {
      this.send(destination, body);
    });
  }
}

const socketService = new SocketService();

export default socketService;
