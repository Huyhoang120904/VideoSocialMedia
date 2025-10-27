import axios, { AxiosError, AxiosInstance } from "axios";


const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://172.20.82.76:8082/api/v1";


console.log("USING API: " + API_URL);


let accessToken: string | null = null;
let isRefreshing = false;
let pendingQueue: {
  resolve: (value?: unknown) => void;
  reject: (value?: unknown) => void;
  config: any;
}[] = [];

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const processQueue = (error: any, token: string | null = null) => {
  pendingQueue.forEach((p) => {
    if (error) p.reject(error);
    else {
      p.config.headers.Authorization = `Bearer ${token}`;
      p.resolve(api(p.config));
    }
  });

  pendingQueue = [];
};

export const setAuthToken: (t: string) => void = (t: string) => {
  accessToken = t ?? null;
};

export const getAuthToken: () => string | null = () => {
  return accessToken;
};

export const clearAuthToken: () => void = () => {
  accessToken = null;
};


// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000, // Increased timeout to 30 seconds
});

api.interceptors.request.use((config) => {
  if (getAuthToken()) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${getAuthToken()}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {

    const original = error.config as any;
    const status = error.response?.status;

    if (status !== 401 || original?._retry) {
      return Promise.reject(error);
    }

    if (!accessToken) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject, config: original });
      });
    }

    isRefreshing = true;

    try {
      const resp = await axios.post(`${API_URL}/auth/refresh`, { accessToken });
      const newToken = resp.data.result.token;
      setAuthToken(newToken);
      processQueue(null, newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return api(original);
    } catch (e) {
      processQueue(e, null);
      clearAuthToken();
      return Promise.reject(e);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
