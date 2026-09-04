import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";

export type LeaderboardPeriod = "DAILY" | "WEEKLY" | "MONTHLY" | "ALL_TIME";

export interface LeaderboardEntry {
  rank:           number;
  userId:         number;
  name:           string;
  profileImage?:  string;
  averageScore:   number;
  accuracy:       number;
  testsCompleted: number;
  isCurrentUser:  boolean;
}

export interface LeaderboardResponse {
  period:          string;
  entries:         LeaderboardEntry[];
  currentUserRank: number | null;
  fromCache:       boolean;
}

export const leaderboardApi = {
  get: (period: LeaderboardPeriod = "ALL_TIME") =>
    apiClient
      .get<ApiResponse<LeaderboardResponse>>("/leaderboard", { params: { period } })
      .then(r => r.data),
};
