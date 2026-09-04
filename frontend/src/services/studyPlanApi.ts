import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";

export interface StudyPlanDto {
  id:                 number;
  title:              string;
  startDate:          string;
  endDate:            string;
  targetTests:        number;
  targetQuestions:    number;
  isActive:           boolean;
  createdAt:          string;
  updatedAt:          string;
  testsCompleted:     number;
  questionsAttempted: number;
  daysTotal:          number;
  daysElapsed:        number;
  daysRemaining:      number;
  progressPercent:    number;
}

export interface StudyPlanRequest {
  title:           string;
  startDate:       string;
  endDate:         string;
  targetTests?:    number;
  targetQuestions?: number;
}

export const studyPlanApi = {
  getAll: () => apiClient.get<ApiResponse<StudyPlanDto[]>>("/study-plan").then(r => r.data),
  create: (d: StudyPlanRequest) => apiClient.post<ApiResponse<StudyPlanDto>>("/study-plan", d).then(r => r.data),
  update: (id: number, d: StudyPlanRequest) => apiClient.put<ApiResponse<StudyPlanDto>>(`/study-plan/${id}`, d).then(r => r.data),
  delete: (id: number) => apiClient.delete<ApiResponse<void>>(`/study-plan/${id}`).then(r => r.data),
};
