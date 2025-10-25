import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// TEMPORARILY COMMENTED OUT - WebSocket causing timeout errors
// import socketService from "../Services/SocketService";
import { useAuth } from "./AuthProvider";

interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribe: (destination: string, callback: (message: any) => void) => void;
  unsubscribe: (destination: string) => void;
  send: (destination: string, body: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  // TEMPORARILY COMMENTED OUT - WebSocket connection causing timeout errors
  // const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  // const connect = useCallback(async () => {
  //   if (!isAuthenticated || isConnecting || isConnected) return;

  //   try {
  //     setIsConnecting(true);
  //     setConnectionError(null);

  //     await socketService.connect();
  //     const connected = socketService.isConnected();
  //     setIsConnected(connected);
  //   } catch (error) {
  //     const errorMessage =
  //       error instanceof Error ? error.message : "Connection failed";
  //     console.error("❌ WebSocket connection failed:", errorMessage);
  //     setConnectionError(errorMessage);
  //   } finally {
  //     setIsConnecting(false);
  //   }
  // }, [isAuthenticated, isConnected, isConnecting]);

  // const disconnect = useCallback(() => {
  //   socketService.disconnect();
  //   setIsConnected(false);
  //   setIsConnecting(false);
  //   setConnectionError(null);
  // }, []);

  // const subscribe = useCallback(
  //   (destination: string, callback: (message: any) => void) => {
  //     socketService.subscribe(destination, callback);
  //   },
  //   []
  // );

  // const unsubscribe = useCallback((destination: string) => {
  //   socketService.unsubscribe(destination);
  // }, []);

  // const send = useCallback((destination: string, body: any) => {
  //   socketService.send(destination, body);
  // }, []);

  // // Auto connect/disconnect based on authentication
  // useEffect(() => {
  //   if (isAuthenticated && !isConnected && !isConnecting) {
  //     connect();
  //   } else if (!isAuthenticated && (isConnected || isConnecting)) {
  //     disconnect();
  //   }
  // }, [isAuthenticated, isConnected, isConnecting, connect, disconnect]);

  // // Handle token changes and reconnection
  // useEffect(() => {
  //   if (isAuthenticated && isConnected && socketService.needsReconnection()) {
  //     console.log("🔄 Token changed, reconnecting...");
  //     disconnect();
  //     connect();
  //   }
  // }, [isAuthenticated, isConnected, connect, disconnect]);

  // Mock functions to prevent errors
  const connect = useCallback(async () => {
    console.log("🔌 WebSocket connection disabled temporarily");
  }, []);

  const disconnect = useCallback(() => {
    console.log("🔌 WebSocket disconnection disabled temporarily");
  }, []);

  const subscribe = useCallback(
    (destination: string, callback: (message: any) => void) => {
      console.log("🔌 WebSocket subscription disabled temporarily");
    },
    []
  );

  const unsubscribe = useCallback((destination: string) => {
    console.log("🔌 WebSocket unsubscription disabled temporarily");
  }, []);

  const send = useCallback((destination: string, body: any) => {
    console.log("🔌 WebSocket send disabled temporarily");
  }, []);

  const value: SocketContextType = {
    isConnected,
    isConnecting,
    connectionError,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    send,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export default SocketProvider;
