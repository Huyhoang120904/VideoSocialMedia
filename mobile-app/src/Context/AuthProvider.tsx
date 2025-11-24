import { createContext, useContext, useEffect, useMemo, useState } from "react";
import * as SecureStore from "expo-secure-store";
import {
  clearAuthToken,
  getAuthToken,
  setAuthToken,
} from "../Services/HttpClient";
import { IntrospectTokenRequest, LoginRequest } from "../Services/AuthService";

type AuthContextType = {
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  user: { imageUrl?: string } | null;
};

const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  isAuthenticated: false,
  login: async () => { },
  logout: async () => { },
  user: null,
});

const TOKEN_KEY = "APP_TOKEN";

export const AuthProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [user, setUser] = useState<{ imageUrl?: string } | null>(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const raw = await SecureStore.getItemAsync(TOKEN_KEY);
        if (raw) {
          const token = raw;
          setAuthToken(token);

          const response = await IntrospectTokenRequest({ token });
          if (response.result?.valid) {
            setHasSession(true);
            setIsAuthenticated(true);
            // Ideally fetch user details here
            // const userDetails = await fetchMyDetails();
            // setUser(userDetails);
          } else {
            await SecureStore.deleteItemAsync(TOKEN_KEY);
            clearAuthToken();
          }
        }
      } catch (error) {
        console.warn("Failed to restore session:", error);
        clearAuthToken();
        await SecureStore.deleteItemAsync(TOKEN_KEY);
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
        throw new Error("Invalid response from server");
      }

      const token = res.result.token;
      setIsAuthenticated(true);
      setAuthToken(token);
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      setHasSession(true);
      // Fetch user details after login
    } catch (error) {
      // Rethrow the error so it can be caught and displayed in the Login component
      throw error;
    }
  };
  const logout = async () => {
    clearAuthToken();
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    setHasSession(false);
    setIsAuthenticated(false);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      isLoading,
      isAuthenticated: hasSession && !!getAuthToken() && isAuthenticated,
      // isAuthenticated: true,
      login,
      logout,
      user,
    }),
    [isLoading, hasSession, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
