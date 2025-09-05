import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../Services/HttpClient";
import { LoginRequest } from "../Services/AuthService";

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: async () => {},
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
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  });

  const login = async (username: string, password: string) => {
    const res = await LoginRequest({ username, password });

    const token = res.result.token;

    console.log(`token`, token);

    setAuthToken(token);
    console.log(`JSON.stringify(token): `, token);
    await SecureStore.setItemAsync(TOKEN_KEY, token);
    setHasSession(true);
  };
  const logout = async () => {
    clearAuthToken();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setHasSession(false);
  };

  const value = useMemo(
    () => ({
      isLoading,
      // isAuthenticated: hasSession && !!getAuthToken(),
      isAuthenticated: true,

      login,
      logout,
    }),
    [isLoading, hasSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
