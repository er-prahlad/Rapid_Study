// ─── Shared API types ────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  language: 'EN' | 'HINDI' | 'ENGLISH';
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: 'STUDENT' | 'ADMIN' | 'SUPER_ADMIN';
  isActive: boolean;
  language: 'ENGLISH' | 'HINDI';
  createdAt: string;
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────

export interface AdminDashboard {
  totalUsers: number;
  activeUsers: number;
  totalExams: number;
  totalQuestions: number;
  totalTests: number;
  totalAttempts: number;
  todaysAttempts?: number;
  attemptsToday?: number;
  recentRegistrations?: number;
  totalSubjects?: number;
  totalTopics?: number;
  averageScore?: number;
  userGrowth?: ChartPoint[];
  userRegistrations?: ChartPoint[];
  attemptTrend?: ChartPoint[];
  testAttempts?: ChartPoint[];
  popularExams?: (PopularExam | { examId: number; examName: string; attempts: number })[];
  topPerformers?: TopPerformer[];
}

export interface ChartPoint {
  label: string;
  value: number;
}

export interface PopularExam {
  examId?: number;
  examName: string;
  attempts?: number;
  attemptCount?: number;
}

export interface TopPerformer {
  name: string;
  score: number;
  exam: string;
}

// ─── Admin User ───────────────────────────────────────────────────────────────

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  language: string;
  lastLoginAt: string | null;
  createdAt: string;
  totalAttempts: number;
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export interface ExamDto {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  subjectCount?: number;
  topicCount?: number;
  questionCount?: number;
  totalSubjects?: number;
  totalTests?: number;
  createdAt: string;
}

export interface ExamRequest {
  name: string;
  code: string;
  description?: string;
}

export interface SubjectDto {
  id: number;
  name: string;
  examId: number;
  examName?: string;
  description?: string;
  displayOrder?: number;
  topicCount?: number;
  topics?: TopicDto[];
}

export interface SubjectRequest {
  name: string;
  examId: number;
  description?: string;
  displayOrder?: number;
}

export interface TopicDto {
  id: number;
  name: string;
  subjectId: number;
  subjectName?: string;
  description?: string;
  displayOrder?: number;
  questionCount?: number;
}

export interface TopicRequest {
  name: string;
  subjectId: number;
  description?: string;
  displayOrder?: number;
}

// ─── Question ─────────────────────────────────────────────────────────────────

export interface OptionDto {
  id: number;
  optionNumber: number;
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionDto {
  id: number;
  questionText: string;
  questionType: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  status: string;
  topicId: number;
  topicName: string;
  subjectName: string;
  examName: string;
  options: OptionDto[];
  explanation: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface OptionRequest {
  optionText: string;
  isCorrect: boolean;
}

export interface QuestionRequest {
  questionText: string;
  questionType: string;
  difficulty: string;
  topicId: number;
  options: OptionRequest[];
  explanation?: string;
}

export interface ImportResultDto {
  totalRows: number;
  imported: number;
  failed: number;
  duplicates: number;
  errors: string[];
}

// ─── Mock Test ────────────────────────────────────────────────────────────────

export interface MockTestDto {
  id: number;
  title: string;
  description: string | null;
  examId: number;
  examName: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
  isPublished: boolean;
  questionCount: number;
  attemptCount: number;
  createdAt: string;
}

export interface MockTestRequest {
  title: string;
  description?: string;
  examId: number;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  negativeMarking: boolean;
  negativeMarkValue: number;
}

export interface AddQuestionsRequest {
  questionIds?: number[];
  randomCount?: number;
  topicId?: number;
  difficulty?: string;
}
