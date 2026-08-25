export interface ExamDto {
  id: number;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TopicDto {
  id: number;
  subjectId: number;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface SubjectDto {
  id: number;
  examId: number;
  name: string;
  description?: string;
  displayOrder: number;
  topics?: TopicDto[];
}

export interface ExamDetailDto {
  id: number;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  isActive: boolean;
  totalSubjects: number;
  totalTests: number;
  createdAt: string;
  subjects: SubjectDto[];
}

export interface MockTestSummaryDto {
  id: number;
  examId: number;
  title: string;
  description?: string;
  durationMinutes: number;
  totalQuestions: number;
  totalMarks: number;
  negativeMarks: number;
  isPublished: boolean;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  last: boolean;
  first: boolean;
}

// Admin request types
export interface ExamRequest {
  name: string;
  code: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export interface SubjectRequest {
  examId: number;
  name: string;
  description?: string;
  displayOrder?: number;
}

export interface TopicRequest {
  subjectId: number;
  name: string;
  description?: string;
  displayOrder?: number;
}
