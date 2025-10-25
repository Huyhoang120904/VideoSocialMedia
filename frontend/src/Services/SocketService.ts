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
      this.disconnect();
    }

    this.currentToken = token;

    // Get WebSocket URL
    const baseUrl = process.env.EXPO_PUBLIC_WS_URL || "http://192.168.1.230:8082/ws-native";

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
          debug: () => {
            // Disable STOMP debug logs
          },
          onConnect: () => {
            clearTimeout(timeout);
            this.isConnecting = false;

            // Process any queued messages
            this.processMessageQueue();

            resolve();
          },
          onStompError: (frame) => {
            clearTimeout(timeout);
            this.isConnecting = false;
            reject(new Error("STOMP connection failed"));
          },
          onWebSocketError: (error) => {
            clearTimeout(timeout);
            this.isConnecting = false;
            reject(new Error("WebSocket connection failed"));
          },
          onWebSocketClose: () => {
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
      return;
    }
    
    // Subscribe using STOMP client
    const subscription = this.stompClient!.subscribe(destination, (message: IMessage) => {
      try {
        const data = JSON.parse(message.body);
        callback(data);
      } catch (error) {
        callback(message.body);
      }
    });

    this.subscriptions.set(destination, subscription);
  }

  unsubscribe(destination: string): void {
    if (this.subscriptions.has(destination)) {
      const subscription = this.subscriptions.get(destination);
      subscription?.unsubscribe();
      this.subscriptions.delete(destination);
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
      // Silent error handling
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
