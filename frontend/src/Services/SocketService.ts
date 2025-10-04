import SockJS from "sockjs-client";
import { getAuthToken } from "./HttpClient";

export class SocketService {
  private socket: WebSocket | null = null;
  private subscriptions: Map<string, (message: any) => void> = new Map();
  private messageQueue: Array<{ destination: string; body: any }> = [];
  private isConnecting: boolean = false;

  async connect(): Promise<void> {
    // Skip if already connected
    if (this.socket?.readyState === WebSocket.OPEN) return;

    // Skip if already connecting
    if (this.isConnecting) return;

    // Check for authentication token
    const token = getAuthToken();
    if (!token) throw new Error("No auth token available");

    // Get WebSocket URL
    const url = process.env.EXPO_PUBLIC_WS_URL;
    if (!url) throw new Error("WebSocket URL not configured");

    this.isConnecting = true;

    // Simple promise-based connection using SockJS
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.isConnecting = false;
        reject(new Error("Connection timeout"));
      }, 10000);

      try {
        // Create SockJS connection
        this.socket = new SockJS(url) as WebSocket;

        this.socket.onopen = () => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.log("SocketService: Connected via SockJS");

          // Send authentication after connection
          this.send("/app/authenticate", { token });

          // Process any queued messages
          this.processMessageQueue();

          resolve();
        };

        this.socket.onerror = (error) => {
          clearTimeout(timeout);
          this.isConnecting = false;
          console.error("SocketService: Connection failed:", error);
          reject(new Error("SockJS connection failed"));
        };

        this.socket.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.socket.onclose = () => {
          console.log("SocketService: Connection closed");
          this.isConnecting = false;
        };
      } catch (error) {
        clearTimeout(timeout);
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (!this.socket) return;

    this.subscriptions.clear();
    this.messageQueue = [];
    this.socket.close();
    this.socket = null;
    this.isConnecting = false;
    console.log("SocketService: Disconnected");
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  subscribe(destination: string, callback: (message: any) => void): void {
    if (!this.isConnected()) {
      console.error("Cannot subscribe: Socket not connected");
      return;
    }

    this.subscriptions.set(destination, callback);

    // Send subscription message
    this.send("/app/subscribe", { destination });
  }

  unsubscribe(destination: string): void {
    if (this.subscriptions.has(destination)) {
      this.subscriptions.delete(destination);

      // Send unsubscribe message
      if (this.isConnected()) {
        this.send("/app/unsubscribe", { destination });
      }
    }
  }

  send(destination: string, body: any): void {
    const message = {
      destination,
      body: JSON.stringify(body),
      timestamp: Date.now(),
    };

    if (!this.isConnected()) {
      console.log("Socket not connected, queuing message");
      this.messageQueue.push({ destination, body });
      return;
    }

    try {
      this.socket?.send(JSON.stringify(message));
    } catch (error) {
      console.error("Error sending message:", error);
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data);
      const { destination, body } = message;

      // Find matching subscription
      const callback = this.subscriptions.get(destination);
      if (callback) {
        try {
          const data = typeof body === "string" ? JSON.parse(body) : body;
          callback(data);
        } catch (parseError) {
          console.error(
            `Error parsing message body from ${destination}:`,
            parseError
          );
          callback(body);
        }
      } else {
        console.log(`No subscription found for destination: ${destination}`);
      }
    } catch (error) {
      console.error("Error handling incoming message:", error);
    }
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length === 0) return;

    console.log(`Processing ${this.messageQueue.length} queued messages`);

    const messages = [...this.messageQueue];
    this.messageQueue = [];

    messages.forEach(({ destination, body }) => {
      this.send(destination, body);
    });
  }
}

const socketService = new SocketService();

export default socketService;
