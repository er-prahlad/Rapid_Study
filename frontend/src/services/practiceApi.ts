import apiClient from "./apiClient";
import type { ApiResponse } from "@/types";
import type { PageResponse } from "@/types/exam";

export interface OptionDto {
  id:              number;
  optionText:      string;
  optionTextHindi?: string;
  optionOrder:     number;
  isCorrect:       boolean | null; // null when not yet revealed
}

export interface QuestionDto {
  id:                number;
  topicId:           number;
  topicName?:        string;
  subjectName?:      string;
  examName?:         string;
  questionText:      string;
  questionTextHindi?: string;
  questionType:      string;
  difficulty:        "EASY" | "MEDIUM" | "HARD";
  explanation?:      string;
  explanationHindi?: string;
  marks:             number;
  negativeMarks:     number;
  isActive:          boolean;
  options:           OptionDto[];
}

export type PracticeMode = "RANDOM" | "SUBJECT" | "TOPIC" | "WEAK_AREA" | "DIFFICULTY" | "PREVIOUS_MISTAKES";

export const practiceApi = {
  getQuestions: (params: {
    topicId?:   number;
    subjectId?: number;
    difficulty?: string;
    page?:      number;
    size?:      number;
  }) =>
    apiClient
      .get<ApiResponse<PageResponse<QuestionDto>>>("/practice/questions", { params })
      .then(r => r.data),

  getWrongQuestions: (params?: { page?: number; size?: number }) =>
    apiClient
      .get<ApiResponse<PageResponse<QuestionDto>>>("/practice/mistakes", { params })
      .then(r => r.data),
};
