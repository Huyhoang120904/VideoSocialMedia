import { create } from "zustand";
import { toast } from "sonner";
import { authService, userService, UserResponse } from "@/services/api";

/**
 * Authentication Store using Zustand for Admin Portal
 * Manages global authentication state
 *
 * @author: TikTok Clone Admin Team
 * @date: 10/25/2025
 */

interface User {
  id: string;
  email: string;
  username: string;
  role: "admin" | "moderator";
  avatar?: string;
}

interface AuthStoreState {
  user: User | null;
  accessToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  refreshToken: string | null;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setAccessToken: (token: string) => void;
  setRefreshToken: (token: string) => void;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  accessToken: null,
  loading: false,
  isAuthenticated: false,
  refreshToken: null,

  setUser: (user: User) => {
    set({ user });
  },

  setRefreshToken: (token: string) => {
    set({ refreshToken: token });
  },

  // Set access token and update axios config
  setAccessToken: (token: string) => {
    set({ accessToken: token, isAuthenticated: true });
  },

  // Clear authentication
  clearAuth: async () => {
    set({
      accessToken: null,
      isAuthenticated: false,
      refreshToken: null,
      user: null,
    });
  },

  // Login with username/password
  login: async (username: string, password: string) => {
    try {
      console.log("🔐 Login attempt started", {
        username,
        passwordLength: password.length,
        timestamp: new Date().toISOString(),
      });

      set({ loading: true });

      const response = await authService.authenticate({ username, password });

      console.log("🔐 Login API response", {
        code: response.code,
        hasToken: !!response.result?.token,
        tokenPreview: response.result?.token
          ? `${response.result.token.substring(0, 20)}...`
          : null,
        expireAt: response.result?.expireAt,
        timestamp: new Date().toISOString(),
      });

      if (response.code === 1000 && response.result) {
        const { token } = response.result;

        set({
          accessToken: token,
          isAuthenticated: true,
          refreshToken: null, // Backend doesn't provide refresh token
        });

        localStorage.setItem("accessToken", token);
        // Note: Backend doesn't provide refresh token, so we don't store one

        // Don't set user here - let AuthProvider handle it
        // This ensures the AuthProvider runs its redirect logic
        console.log(
          "✅ Login successful, token stored. AuthProvider will handle user loading and redirect.",
          {
            tokenPreview: `${token.substring(0, 20)}...`,
            tokenLength: token.length,
            timestamp: new Date().toISOString(),
          }
        );

        // Force a small delay to ensure localStorage is updated and AuthProvider can detect the change
        setTimeout(() => {
          console.log(
            "⏰ Login completed, AuthProvider should now detect token and redirect",
            {
              localStorageToken: localStorage.getItem("accessToken")
                ? `${localStorage.getItem("accessToken")?.substring(0, 20)}...`
                : null,
              timestamp: new Date().toISOString(),
            }
          );

          // Trigger a custom event to notify AuthProvider of token change
          window.dispatchEvent(
            new CustomEvent("tokenUpdated", {
              detail: { token: token },
            })
          );
        }, 100);

        toast.success("Login successful!");
        return true;
      } else {
        console.error("❌ Login failed:", {
          code: response.code,
          message: response.message,
          timestamp: new Date().toISOString(),
        });
        toast.error(response.message || "Invalid credentials");
        return false;
      }
    } catch (error: any) {
      console.error("💥 Login error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
    try {
      const { accessToken } = get();
      if (accessToken) {
        await authService.logout(accessToken);
      }
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      toast.success("Logged out successfully!");
      get().clearAuth();
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed!");
      get().clearAuth();
    }
  },
}));

export default useAuthStore;
