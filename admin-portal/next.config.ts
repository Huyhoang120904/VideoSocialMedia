import type { NextConfig } from "next";

// Default backend URL if environment variable is not set
const defaultBackendUrl = "http://localhost:8082/api/v1";
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL || defaultBackendUrl;

// Extract hostname for image domains
let backendHost: string;
try {
  backendHost = new URL(backendUrl).hostname;
} catch (error) {
  console.warn("Invalid backend URL, using localhost:", error);
  backendHost = "localhost";
}

const nextConfig: NextConfig = {
  images: {
    domains: [backendHost],
  },
  env: {
    NEXT_PUBLIC_BACKEND_API_URL: backendUrl,
  },
};

export default nextConfig;
