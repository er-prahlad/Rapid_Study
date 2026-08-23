// ─── Auth ────────────────────────────────────────────────────────────────────

export type Role = "STUDENT" | "ADMIN";
export type Language = "EN" | "HI" | "HIEN";

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  name: string;
  email: string;
  role: Role;
  language: Language;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  profileImage?: string;
  role: Role;
  language: Language;
  isActive: boolean;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  phone?: string;
  password: string;
  language?: Language;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

// ─── Exam ─────────────────────────────────────────────────────────────────────

export interface Exam {
  id: number;
  name: string;
  code: string;
  description?: string;
  logo?: string;
  isActive: boolean;
}

export interface Subject {
  id: number;
  examId: number;
  name: string;
  description?: string;
  displayOrder: number;
}

export interface Topic {
  id: number;
  subjectId: number;
  name: string;
  description?: string;
  displayOrder: number;
}

// ─── Mock Test ───────────────────────────────────────────────────────────────

export interface MockTest {
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

// ─── Test Attempt ─────────────────────────────────────────────────────────────

export type AttemptStatus = "IN_PROGRESS" | "COMPLETED" | "ABANDONED";

export interface TestAttempt {
  id: number;
  mockTestId: number;
  startedAt: string;
  submittedAt?: string;
  expiresAt: string;
  score?: number;
  totalMarks: number;
  correctAnswers?: number;
  wrongAnswers?: number;
  unanswered?: number;
  status: AttemptStatus;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export interface DashboardData {
  user: UserProfile;
  stats: {
    testsAttempted: number;
    averageScore: number;
    currentStreak: number;
    totalQuestions: number;
    accuracy: number;
    rank: number;
  };
  dailyTarget: {
    questionsTarget: number;
    questionsDone: number;
    testsTarget: number;
    testsDone: number;
  };
  recentAttempts: RecentAttempt[];
  popularExams: Exam[];
  upcomingTests: MockTest[];
  subjectPerformance: SubjectPerformance[];
  leaderboard: LeaderboardEntry[];
}

export interface RecentAttempt {
  id: number;
  testTitle: string;
  score: number;
  totalMarks: number;
  accuracy: number;
  submittedAt: string;
}

export interface SubjectPerformance {
  subjectName: string;
  accuracy: number;
  attempted: number;
  correct: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  name: string;
  profileImage?: string;
  score: number;
  accuracy: number;
  tests: number;
  isCurrentUser?: boolean;
}
