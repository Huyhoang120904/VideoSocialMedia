import { Client, StompSubscription } from "@stomp/stompjs";
import { getAuthToken } from "./HttpClient";

export class SocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> = new Map();

  private getWebSocketUrl(): string {
    const API_URL = process.env.EXPO_PUBLIC_WS_URL;

    if (!API_URL) {
      throw new Error("EXPO_PUBLIC_WS_URL environment variable is not set");
    }

    // Convert HTTP(S) URLs to WebSocket URLs
    if (API_URL.startsWith("http://")) {
      return API_URL.replace("http://", "ws://");
    } else if (API_URL.startsWith("https://")) {
      return API_URL.replace("https://", "wss://");
    }

    return API_URL;
  }

  async connect(): Promise<void> {
    if (this.client?.connected) {
      return;
    }

    const token = getAuthToken();
    if (!token) {
      throw new Error("No auth token available for socket connection");
    }

    const url = this.getWebSocketUrl();
    console.log(`SocketService: Connecting to ${url}`);

    this.client = new Client({
      brokerURL: url,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: process.env.NODE_ENV !== "production" ? console.log : undefined,
    });

    return new Promise((resolve, reject) => {
      if (!this.client) {
        reject(new Error("Client not initialized"));
        return;
      }

      const timeout = setTimeout(() => {
        reject(new Error("Connection timeout"));
      }, 10000);

      this.client.onConnect = () => {
        console.log("SocketService: Connected");
        clearTimeout(timeout);
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error("SocketService: STOMP error:", frame.headers?.message);
        clearTimeout(timeout);
        reject(new Error(frame.headers?.message || "Connection failed"));
      };

      this.client.activate();
    });
  }

  disconnect(): void {
    if (this.client) {
      this.subscriptions.clear();
      this.client.deactivate();
      this.client = null;
      console.log("SocketService: Disconnected");
    }
  }

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  subscribe(
    destination: string,
    callback: (message: any) => void
  ): StompSubscription | null {
    if (!this.client?.connected) {
      console.error("Cannot subscribe: Socket not connected");
      return null;
    }

    const subscription = this.client.subscribe(destination, (message) => {
      try {
        const parsedMessage = message.body ? JSON.parse(message.body) : null;
        callback(parsedMessage);
      } catch (error) {
        console.error(`Error parsing message from ${destination}:`, error);
        callback(message.body);
      }
    });

    this.subscriptions.set(destination, subscription);
    console.log(`SocketService: Subscribed to ${destination}`);
    return subscription;
  }

  unsubscribe(destination: string): void {
    const subscription = this.subscriptions.get(destination);
    if (subscription) {
      subscription.unsubscribe();
      this.subscriptions.delete(destination);
      console.log(`SocketService: Unsubscribed from ${destination}`);
    }
  }

  send(destination: string, body: any): void {
    if (!this.client?.connected) {
      console.error("Cannot send message: Socket not connected");
      return;
    }

    this.client.publish({
      destination,
      body: JSON.stringify(body),
    });
  }
}

const socketService = new SocketService();

export default socketService;
