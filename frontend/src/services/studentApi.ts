import { ApiResponse, DashboardData } from "@/types";
import apiClient from "./apiClient";
import type { PerformanceResponse } from "./attemptApi";

export const studentApi = {
  getDashboard: () =>
    apiClient.get<ApiResponse<DashboardData>>("/student/dashboard").then((r) => r.data),

  getPerformance: () =>
    apiClient.get<ApiResponse<PerformanceResponse>>("/student/performance").then((r) => r.data),
};
