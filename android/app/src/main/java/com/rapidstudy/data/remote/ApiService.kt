package com.rapidstudy.data.remote

import com.rapidstudy.data.model.*
import retrofit2.Response
import retrofit2.http.*

/**
 * Phase 50: Retrofit API service — same backend use karta hai.
 * Base URL configurable hai BuildConfig se.
 */
interface ApiService {

    // ── Auth ──────────────────────────────────────────────────────────
    @POST("auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<ApiResponse<AuthResponse>>

    @POST("auth/logout")
    suspend fun logout(): Response<ApiResponse<Void>>

    @GET("auth/me")
    suspend fun getProfile(): Response<ApiResponse<UserProfile>>

    // ── Dashboard ─────────────────────────────────────────────────────
    @GET("student/dashboard")
    suspend fun getDashboard(): Response<ApiResponse<DashboardResponse>>

    // ── Exams ─────────────────────────────────────────────────────────
    @GET("exams")
    suspend fun getExams(
        @Query("search") search: String? = null,
        @Query("page")   page: Int = 0,
        @Query("size")   size: Int = 20
    ): Response<ApiResponse<PageResponse<Exam>>>

    @GET("exams/{id}")
    suspend fun getExam(@Path("id") id: Long): Response<ApiResponse<Any>>

    // ── Mock Tests ────────────────────────────────────────────────────
    @GET("tests")
    suspend fun getTests(
        @Query("examId") examId: Long? = null,
        @Query("page")   page: Int = 0,
        @Query("size")   size: Int = 20
    ): Response<ApiResponse<PageResponse<MockTest>>>

    @GET("tests/{id}")
    suspend fun getTest(@Path("id") id: Long): Response<ApiResponse<MockTest>>

    // ── Test Attempt (Phase 51) ───────────────────────────────────────
    @POST("tests/{testId}/attempts")
    suspend fun startAttempt(@Path("testId") testId: Long): Response<ApiResponse<StartAttemptResponse>>

    @PUT("attempts/{id}/answers/{questionId}")
    suspend fun saveAnswer(
        @Path("id")         attemptId: Long,
        @Path("questionId") questionId: Long,
        @Body request: SaveAnswerRequest
    ): Response<ApiResponse<Any>>

    @DELETE("attempts/{id}/answers/{questionId}")
    suspend fun clearAnswer(
        @Path("id")         attemptId: Long,
        @Path("questionId") questionId: Long
    ): Response<ApiResponse<Void>>

    @PUT("attempts/{id}/questions/{questionId}/review")
    suspend fun markForReview(
        @Path("id")         attemptId: Long,
        @Path("questionId") questionId: Long
    ): Response<ApiResponse<Any>>

    @POST("attempts/{id}/submit")
    suspend fun submitAttempt(@Path("id") attemptId: Long): Response<ApiResponse<SubmitResponse>>

    @GET("attempts/{id}/result")
    suspend fun getResult(@Path("id") attemptId: Long): Response<ApiResponse<Any>>

    // ── Practice ─────────────────────────────────────────────────────
    @GET("practice/questions")
    suspend fun getPracticeQuestions(
        @Query("topicId")   topicId: Long? = null,
        @Query("difficulty") difficulty: String? = null,
        @Query("page")      page: Int = 0,
        @Query("size")      size: Int = 20
    ): Response<ApiResponse<PageResponse<QuestionSafeDto>>>

    // ── Bookmarks ─────────────────────────────────────────────────────
    @GET("bookmarks")
    suspend fun getBookmarks(@Query("page") page: Int = 0): Response<ApiResponse<PageResponse<Any>>>

    @POST("bookmarks/{questionId}")
    suspend fun addBookmark(@Path("questionId") questionId: Long): Response<ApiResponse<Void>>

    @DELETE("bookmarks/{questionId}")
    suspend fun removeBookmark(@Path("questionId") questionId: Long): Response<ApiResponse<Void>>

    // ── Leaderboard ───────────────────────────────────────────────────
    @GET("leaderboard")
    suspend fun getLeaderboard(
        @Query("period") period: String = "ALL_TIME"
    ): Response<ApiResponse<Any>>

    // ── Notifications ─────────────────────────────────────────────────
    @GET("notifications")
    suspend fun getNotifications(@Query("page") page: Int = 0): Response<ApiResponse<PageResponse<Any>>>

    @PUT("notifications/{id}/read")
    suspend fun markRead(@Path("id") id: Long): Response<ApiResponse<Void>>

    @PUT("notifications/read-all")
    suspend fun markAllRead(): Response<ApiResponse<Void>>
}

// Pagination wrapper
data class PageResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val number: Int,
    val size: Int,
    val last: Boolean,
    val first: Boolean
)
