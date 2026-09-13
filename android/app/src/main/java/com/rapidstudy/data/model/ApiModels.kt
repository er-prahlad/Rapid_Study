package com.rapidstudy.data.model

import com.google.gson.annotations.SerializedName

// ── Generic API wrapper ───────────────────────────────────────────────────────
data class ApiResponse<T>(
    val success: Boolean,
    val message: String,
    val data: T?
)

// ── Auth ──────────────────────────────────────────────────────────────────────
data class LoginRequest(val email: String, val password: String)

data class RegisterRequest(
    val name: String,
    val email: String,
    val password: String,
    val phone: String? = null
)

data class AuthResponse(
    val accessToken: String,
    val refreshToken: String,
    val userId: Long,
    val name: String,
    val email: String,
    val role: String,
    val language: String
)

// ── Dashboard ─────────────────────────────────────────────────────────────────
data class DashboardResponse(
    val user: UserProfile?,
    val stats: Stats?,
    val dailyTarget: DailyTarget?,
    val recentAttempts: List<RecentAttempt>?,
    val popularExams: List<Exam>?,
    val upcomingTests: List<MockTest>?,
    val subjectPerformance: List<SubjectPerformance>?,
    val leaderboard: List<LeaderboardEntry>?
)

data class UserProfile(
    val id: Long,
    val name: String,
    val email: String,
    val phone: String?,
    val profileImage: String?,
    val role: String,
    val language: String,
    val isActive: Boolean,
    val createdAt: String
)

data class Stats(
    val testsAttempted: Int,
    val averageScore: Double,
    val currentStreak: Int,
    val totalQuestions: Long,
    val accuracy: Double,
    val rank: Int
)

data class DailyTarget(
    val questionsTarget: Int,
    val questionsDone: Int,
    val testsTarget: Int,
    val testsDone: Int
)

data class RecentAttempt(
    val id: Long,
    val testTitle: String,
    val score: Double,
    val totalMarks: Double,
    val accuracy: Double,
    val submittedAt: String
)

// ── Exam ──────────────────────────────────────────────────────────────────────
data class Exam(
    val id: Long,
    val name: String,
    val code: String,
    val description: String?,
    val logo: String?,
    val isActive: Boolean
)

// ── Mock Test ─────────────────────────────────────────────────────────────────
data class MockTest(
    val id: Long,
    val examId: Long,
    val examName: String?,
    val title: String,
    val description: String?,
    val durationMinutes: Int,
    val totalQuestions: Int,
    val totalMarks: Double,
    val negativeMarks: Double,
    val isPublished: Boolean
)

// ── Leaderboard ───────────────────────────────────────────────────────────────
data class LeaderboardEntry(
    val rank: Int,
    val userId: Long,
    val name: String,
    val profileImage: String?,
    val averageScore: Double,
    val accuracy: Double,
    val testsCompleted: Int,
    val isCurrentUser: Boolean
)

data class SubjectPerformance(
    val subjectName: String,
    val accuracy: Double,
    val attempted: Int,
    val correct: Int
)

// ── Question ──────────────────────────────────────────────────────────────────
data class QuestionSafeDto(
    val id: Long,
    val topicId: Long,
    val topicName: String?,
    val questionText: String,
    val questionTextHindi: String?,
    val questionType: String,
    val difficulty: String,
    val marks: Double,
    val negativeMarks: Double,
    val options: List<OptionDto>
)

data class OptionDto(
    val id: Long,
    val optionText: String,
    val optionTextHindi: String?,
    val optionOrder: Int,
    val isCorrect: Boolean? = null  // null = active test mein hidden
)

// ── Test Attempt ──────────────────────────────────────────────────────────────
data class StartAttemptResponse(
    val attemptId: Long,
    val mockTestId: Long,
    val testTitle: String,
    val durationMinutes: Int,
    val startedAt: String,
    val expiresAt: String,
    val questions: List<QuestionSafeDto>
)

data class SaveAnswerRequest(val selectedOptionId: Long)

data class SubmitResponse(
    val attemptId: Long,
    val score: Double,
    val totalMarks: Double,
    val percentage: Double,
    val accuracy: Double,
    val correctAnswers: Int,
    val wrongAnswers: Int,
    val unanswered: Int,
    val timeTakenSeconds: Int,
    val submittedAt: String,
    val wasExpired: Boolean
)
