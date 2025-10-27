import { create } from "zustand";
import { toast } from "sonner";

/**
 * Authentication Store using Zustand for Admin Portal
 * Manages global authentication state with cookie-based authentication
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
  loading: boolean;
  isAuthenticated: boolean;

  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearAuth: () => void;
}

const useAuthStore = create<AuthStoreState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,

  setUser: (user: User) => {
    set({ user, isAuthenticated: true });
  },

  // Clear authentication
  clearAuth: () => {
    set({
      isAuthenticated: false,
      user: null,
    });
  },

  // Login with username/password using API route
  login: async (username: string, password: string) => {
    try {
      console.log("🔐 Login attempt started", {
        username,
        passwordLength: password.length,
        timestamp: new Date().toISOString(),
      });

      set({ loading: true });

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Include cookies
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      console.log("🔐 Login API response", {
        status: response.status,
        success: data.success,
        timestamp: new Date().toISOString(),
      });

      if (response.ok && data.success) {
        console.log(
          "✅ Login successful, cookie set. AuthProvider will handle user loading and redirect."
        );

        toast.success("Login successful!");
        return true;
      } else {
        console.error("❌ Login failed:", {
          status: response.status,
          error: data.error,
          timestamp: new Date().toISOString(),
        });
        toast.error(data.error || "Invalid credentials");
        return false;
      }
    } catch (error: any) {
      console.error("💥 Login error:", {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString(),
      });
      toast.error("Login failed");
      return false;
    } finally {
      set({ loading: false });
    }
  },

  // Logout using API route
  logout: async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      });

      if (response.ok) {
        toast.success("Logged out successfully!");
      } else {
        toast.error("Logout failed!");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed!");
    } finally {
      get().clearAuth();
    }
  },
}));

export default useAuthStore;
