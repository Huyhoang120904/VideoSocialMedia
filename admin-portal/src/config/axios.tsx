import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_API_URL || "http://localhost:8082/api/v1";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

// Cache for the authentication token
let cachedToken: string | null = null;
let tokenFetchPromise: Promise<string | null> | null = null;

// Function to get token from server-side cookie
async function getAuthToken(): Promise<string | null> {
  // Return cached token if available
  if (cachedToken) {
    return cachedToken;
  }

  // If a fetch is already in progress, wait for it
  if (tokenFetchPromise) {
    return tokenFetchPromise;
  }

  // Start fetching token
  tokenFetchPromise = fetch("/api/auth/token", {
    method: "GET",
    credentials: "include",
  })
    .then(async (response) => {
      if (response.ok) {
        const data = await response.json();
        cachedToken = data.token || null;
        return cachedToken;
      }
      return null;
    })
    .catch((error) => {
      console.error("Failed to get auth token:", error);
      return null;
    })
    .finally(() => {
      tokenFetchPromise = null;
    });

  return tokenFetchPromise;
}

// Function to clear cached token
export function clearAuthToken() {
  cachedToken = null;
}

// Request interceptor to add Authorization header
apiClient.interceptors.request.use(
  async (config) => {
    // For server-side requests, cookies are handled automatically
    // For client-side requests, we need to get the token via an API route
    if (typeof window !== "undefined") {
      const token = await getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle authentication errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Clear cached token
        clearAuthToken();
        
        // Attempt to refresh token via API route
        const refreshResponse = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });

        if (refreshResponse.ok) {
          // Token refreshed successfully, retry original request
          return apiClient(originalRequest);
        } else {
          // Refresh failed, redirect to login
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
