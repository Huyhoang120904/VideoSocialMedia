import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../Services/HttpClient";
import { LoginRequest } from "../Services/AuthService";
import { useConversations } from "./ConversationProvider";

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  login: async () => { },
  logout: async () => { },
});

const TOKEN_KEY = "APP_TOKEN";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasSession, setHasSession] = useState<boolean>(false);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = await SecureStore.getItemAsync(TOKEN_KEY);
        if (raw) {
          const token = JSON.parse(raw);
          setAuthToken(token);
          setHasSession(true);
          setIsAuthenticated(true); // Set authenticated if we have a valid token
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    bootstrap();
  }, []); // Add dependency array to prevent infinite re-renders

  const login = async (username: string, password: string) => {
    try {
      const res = await LoginRequest({ username, password });

      // Check if we have a valid response with token
      if (!res || !res.result || !res.result.token) {
        console.error("Invalid login response:", JSON.stringify(res, null, 2));
        throw new Error("Invalid response from server");
      }

      const token = res.result.token;
      console.log(`Token received successfully: ` + token);
      setIsAuthenticated(true);
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setHasSession(true);
    } catch (error) {
      console.error("Login request failed:", error);

      // Rethrow the error so it can be caught and displayed in the Login component
      throw error;
    }
  };
  const logout = async () => {
    clearAuthToken();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setHasSession(false);
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isLoading,
      // isAuthenticated: hasSession && !!getAuthToken() && isAuthenticated,
      isAuthenticated: true,
      login,
      logout,
    }),
    [isLoading, hasSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
