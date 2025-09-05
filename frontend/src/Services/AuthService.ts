import api from "./HttpClient";
import { ApiResponse } from "../Types/ApiResponse";
import { LoginResponse } from "../Types/LoginResponse";

export type LoginPayload = { username: string; password: string };

export const LoginRequest = async (
  payload: LoginPayload
): Promise<ApiResponse<LoginResponse>> => {
  const { data } = await api.post<ApiResponse<LoginResponse>>(
    "/auth/token",
    payload
  );
  return data;
};

export const MeRequest = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};
