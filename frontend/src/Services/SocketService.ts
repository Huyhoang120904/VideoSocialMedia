import { Client, StompSubscription } from "@stomp/stompjs";
import { getAuthToken } from "./HttpClient";
import SockJS from "sockjs-client";

export class SocketService {
  private client: Client | null = null;
  private subscriptions: Map<string, StompSubscription> | null = new Map();
  private connectionPromise: Promise<void> | null = null;
  private isConnecting: boolean = false;
  private reconnectDelay: number = 4000;
  private maxReconnectAttempts: number = 5; // Default to 5 reconnect attempts
  private reconnectCount: number = 0;

  constructor() {
    // Don't initialize client in constructor, do it when connecting
  }

  private initializeClient() {
    // Determine if running in emulator (10.0.2.2) or development/production
    const isAndroidEmulator =
      global.window?.location?.hostname === "10.0.2.2" ||
      process.env.EXPO_PUBLIC_API_URL?.includes("10.0.2.2");

    // On Android emulator, use raw WebSocket instead of SockJS for better compatibility
    const useRawWebSocket = isAndroidEmulator;

    // Use appropriate base URL based on environment

    const API_URL = process.env.EXPO_PUBLIC_WS_URL;

    const token = getAuthToken();
    if (!token) {
      console.warn("No auth token available for socket connection");
      return;
    }

    // Choose the appropriate WebSocket endpoint based on client type
    const connectUrl = API_URL;

    // Minimal connection log
    console.log(`SocketService: Connecting to ${connectUrl}`);

    // Reset reconnect counter when intentionally initializing a new client
    this.reconnectCount = 0;

    // Client configuration
    this.client = new Client({
      // Use different connection method based on environment

      webSocketFactory: () => {
        return new SockJS(connectUrl, null, {
          transports: ["websocket", "xhr-streaming", "xhr-polling"],
          timeout: 15000, // Increase timeout for slow connections
        });
      },
      connectHeaders: {
        Authorization: `Bearer ${token}`,
        token: token, // Send the token directly without calling getAuthToken() again
      },
      reconnectDelay: this.reconnectDelay,
      heartbeatIncoming: 10000, // Longer heartbeat intervals for mobile
      heartbeatOutgoing: 10000,
      // Only log in development environments
      debug:
        process.env.NODE_ENV !== "production"
          ? (str) => {
              if (str.includes("error") || str.includes("fail")) {
                console.log("STOMP:", str);
              }
            }
          : undefined,
      onConnect: (frame) => {
        console.log("SocketService: Connected");
        this.isConnecting = false;
      },
      onDisconnect: () => {
        console.log("SocketService: Disconnected");
        this.isConnecting = false;
      },
      onStompError: (frame) => {
        console.error(
          "SocketService: STOMP error:",
          frame.headers?.message || "Unknown error"
        );
        this.isConnecting = false;
      },
      onWebSocketError: (error) => {
        console.error("SocketService: WebSocket error:", error);
      },
      onWebSocketClose: (event) => {
        console.log(
          `SocketService: WebSocket closed (${event.code}${event.reason ? ": " + event.reason : ""})`
        );
      },
      // Add beforeConnect callback to track reconnection attempts
      beforeConnect: (client) => {
        this.reconnectCount++;

        // Only log every other attempt to reduce noise, always log the last attempt
        if (
          this.reconnectCount % 2 === 0 ||
          this.reconnectCount === this.maxReconnectAttempts
        ) {
          console.log(
            `SocketService: Reconnect ${this.reconnectCount}/${this.maxReconnectAttempts}`
          );
        }

        // If we've reached the limit, deactivate the client to stop further reconnection attempts
        if (this.reconnectCount > this.maxReconnectAttempts) {
          console.warn(
            "SocketService: Max reconnect attempts reached, stopping"
          );
          // We need to use setTimeout to avoid issues with the current connect flow
          setTimeout(() => {
            client.deactivate();
          }, 0);
        }
      },
    });
  }

  async connect(): Promise<void> {
    // Always reinitialize client to ensure fresh token
    this.initializeClient();

    if (!this.client) {
      console.error("SocketService: Client initialization failed");
      throw new Error("Failed to initialize client - check auth token");
    }

    if (this.client?.connected) {
      return Promise.resolve();
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    console.log("SocketService: Connecting...");
    this.isConnecting = true;
    this.connectionPromise = new Promise((resolve, reject) => {
      if (!this.client) {
        this.isConnecting = false;
        reject(new Error("Client not initialized"));
        return;
      }

      // Set up timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error("SocketService: Connection timeout (10s)");
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(new Error("Connection timeout"));
      }, 10000);

      this.client.onConnect = () => {
        console.log("SocketService: Connected successfully");
        clearTimeout(timeout);
        this.isConnecting = false;
        this.connectionPromise = null;
        // Reset reconnect count on successful connection
        this.reconnectCount = 0;
        resolve();
      };

      this.client.onStompError = (frame) => {
        console.error(
          "SocketService: STOMP error:",
          frame.headers?.message || "Unknown error"
        );
        clearTimeout(timeout);
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(
          new Error(`STOMP error: ${frame.headers?.message || "Unknown error"}`)
        );
      };

      this.client.onWebSocketError = (error) => {
        console.error("SocketService: Connection error:", error);
        clearTimeout(timeout);
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(new Error(`WebSocket error: ${error}`));
      };

      this.client.onWebSocketClose = (event) => {
        // Provide more specific error messages based on close codes
        let errorMessage = `WebSocket closed: ${event.code}`;
        switch (event.code) {
          case 1002:
            errorMessage = "WebSocket: Protocol error";
            break;
          case 1006:
            errorMessage = "WebSocket: Connection lost unexpectedly";
            break;
          case 1011:
            errorMessage = "WebSocket: Server error";
            break;
          default:
            if (event.reason) {
              errorMessage = `WebSocket: Closed (${event.code}: ${event.reason})`;
            } else {
              errorMessage = `WebSocket: Closed (${event.code})`;
            }
        }

        console.log(errorMessage);
        clearTimeout(timeout);
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(new Error(errorMessage));

        clearTimeout(timeout);
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(new Error(errorMessage));
      };

      try {
        this.client?.activate();
      } catch (error) {
        console.error("SocketService: Activation error:", error);
        clearTimeout(timeout);
        this.connectionPromise = null;
        this.isConnecting = false;
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.client = null;
    }

    this.connectionPromise = null;
    this.isConnecting = false;
    this.reconnectCount = 0; // Reset reconnect counter on intentional disconnect
  }

  // Debug helper method to test a direct HTTP request to the API
  // This helps verify if the server is accessible at all

  isConnected(): boolean {
    return this.client?.connected ?? false;
  }

  /**
   * Check if we've reached the maximum reconnection attempts
   */
  hasReachedReconnectLimit(): boolean {
    return this.reconnectCount >= this.maxReconnectAttempts;
  }

  /**
   * Reset the reconnection counter to allow reconnection attempts again
   */
  resetReconnectCount(): void {
    this.reconnectCount = 0;
  }

  /**
   * Get current reconnection attempt status
   */
  getReconnectStatus(): {
    current: number;
    max: number;
    hasReachedLimit: boolean;
  } {
    return {
      current: this.reconnectCount,
      max: this.maxReconnectAttempts,
      hasReachedLimit: this.hasReachedReconnectLimit(),
    };
  }

  /**
   * Set maximum reconnection attempts
   * @param max The maximum number of reconnection attempts before giving up
   */
  setMaxReconnectAttempts(max: number): void {
    if (max < 1) {
      this.maxReconnectAttempts = 1;
    } else {
      this.maxReconnectAttempts = max;
    }
  }

  subscribe(dest: string, callback: (message: any) => any) {
    if (!this.client?.connected) {
      throw new Error("Socket not connected");
    }
  }
}

const socketService = new SocketService();

export default socketService;
