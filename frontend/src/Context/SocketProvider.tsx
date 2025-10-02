import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import { connect } from "react-redux";
import socketService from "../Services/SocketService";
import { useAuth } from "./AuthProvider";

interface SocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;

  sendMessage: () => void;
  markAsRead: () => void;
  loadConversationMessages: (conversationId: string) => Promise<void>;

  connect: () => Promise<void>;
  disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
  isConnecting: false,
  connectionError: null,
  sendMessage: () => {},
  markAsRead: () => {},
  loadConversationMessages: (conversationId: string) =>
    new Promise((resolve, reject) => {}),
  connect: () => new Promise((resolve, reject) => {}),
  disconnect: () => {},
});

interface SocketProviderProps {
  children: ReactNode;
}

export const SocketProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  //connect to websocket
  useEffect(() => {
    console.log("SocketProvider: Auth state changed", {
      isAuthenticated,
      isConnected,
      isConnecting,
    });

    if (isAuthenticated && !isConnected && !isConnecting) {
      console.log("SocketProvider: Attempting to connect...");
      connect();
    } else if (!isAuthenticated && (isConnected || isConnecting)) {
      console.log("SocketProvider: Disconnecting due to authentication change");
      disconnect();
    }

    return () => {
      if (!isAuthenticated) {
        disconnect();
      }
    };
  }, [isAuthenticated, isConnected, isConnecting]);

  const connect = useCallback(async () => {
    if (!isAuthenticated || isConnecting || isConnected) return;
    console.log("SocketProvider: Starting connection process...");
    try {
      setIsConnecting(true);
      setConnectionError(null);

      console.log("SocketProvider: Calling socketService.connect()...");
      await socketService.connect();

      console.log(
        "SocketProvider: socketService.connect() completed, checking connection status..."
      );
      if (socketService.isConnected()) {
        console.log(
          "SocketProvider: Connection verified, setting connected state"
        );
        setIsConnected(true);
      } else {
        console.warn(
          "SocketProvider: Connection promise resolved but socket not in connected state"
        );
        throw new Error("Connection established but not in connected state");
      }
    } catch (error) {
      console.error(
        "SocketProvider: Failed to connect messaging service:",
        error
      );
      setConnectionError(
        error instanceof Error ? error.message : "Connection failed"
      );
    } finally {
      console.log(
        "SocketProvider: Connection attempt finished, setting connecting to false"
      );
      setIsConnecting(false);
    }
  }, [isAuthenticated, isConnected, isConnecting]);

  const disconnect = async () => {
    socketService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setConnectionError(null);
    console.log("Socket service disconnected");
  };

  const value: SocketContextType = {
    isConnected,
    isConnecting,
    connectionError,
    sendMessage: () => {},
    markAsRead: () => {},
    loadConversationMessages: (conversationId: string) => new Promise(() => {}),
    connect,
    disconnect,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};

export default SocketProvider;
