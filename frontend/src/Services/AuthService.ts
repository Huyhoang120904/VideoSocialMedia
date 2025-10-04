import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { LoginResponse } from "../Types/response/LoginResponse";

export type LoginPayload = { username: string; password: string };

export const LoginRequest = async (
  payload: LoginPayload
): Promise<ApiResponse<LoginResponse>> => {
  try {
    const { data } = await api.post<ApiResponse<LoginResponse>>(
      "/auth/token",
      payload
    );
    return data;
  } catch (error: any) {
    // Log detailed API error information
    console.error("API Login Error:", error);

    // Log request details
    if (error.config) {
      console.log("Request URL:", error.config.url);
      console.log("Request Method:", error.config.method);
      console.log(
        "Request Headers:",
        JSON.stringify(error.config.headers, null, 2)
      );
    }

    // Log response details if available
    if (error.response) {
      console.log("Response Status:", error.response.status);
      console.log(
        "Response Headers:",
        JSON.stringify(error.response.headers, null, 2)
      );
      console.log(
        "Response Data:",
        JSON.stringify(error.response.data, null, 2)
      );
    } else if (error.request) {
      // Request was made but no response was received
      console.log("No response received:", error.request);
    } else {
      // Something happened in setting up the request
      console.log("Error Message:", error.message);
    }

    // Rethrow with enhanced message if possible
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
};

export const MeRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
