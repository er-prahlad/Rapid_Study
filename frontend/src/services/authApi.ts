import { ApiResponse, AuthResponse, LoginRequest, RegisterRequest, UserProfile } from "@/types";
import apiClient from "./apiClient";

export const authApi = {
  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data).then((r) => r.data),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data).then((r) => r.data),

  logout: () =>
    apiClient.post<ApiResponse<null>>("/auth/logout").then((r) => r.data),

  me: () =>
    apiClient.get<ApiResponse<UserProfile>>("/auth/me").then((r) => r.data),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken }).then((r) => r.data),
};
