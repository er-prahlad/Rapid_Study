import { ApiResponse, DashboardData } from "@/types";
import apiClient from "./apiClient";

export const studentApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardData>>("/student/dashboard").then((r) => r.data),
};
