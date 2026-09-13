package com.rapidstudy.ui.navigation

/**
 * App ke saare navigation routes.
 * Type-safe navigation ke liye sealed class use kiya.
 */
sealed class Screen(val route: String) {
    // Auth
    object Splash    : Screen("splash")
    object Login     : Screen("login")
    object Register  : Screen("register")

    // Main (bottom nav)
    object Home          : Screen("home")
    object MockTests     : Screen("mock_tests")
    object StudyPlan     : Screen("study_plan")
    object Notifications : Screen("notifications")

    // Exam flow
    object ExamList   : Screen("exam_list")
    object ExamDetail : Screen("exam_detail/{examId}") {
        fun createRoute(examId: Long) = "exam_detail/$examId"
    }

    // Test flow
    object TestInstructions : Screen("test_instructions/{testId}") {
        fun createRoute(testId: Long) = "test_instructions/$testId"
    }
    object TestAttempt : Screen("test_attempt/{attemptId}") {
        fun createRoute(attemptId: Long) = "test_attempt/$attemptId"
    }
    object TestResult : Screen("test_result/{attemptId}") {
        fun createRoute(attemptId: Long) = "test_result/$attemptId"
    }
    object TestAnalysis : Screen("test_analysis/{attemptId}") {
        fun createRoute(attemptId: Long) = "test_analysis/$attemptId"
    }

    // Other
    object Practice     : Screen("practice")
    object Bookmarks    : Screen("bookmarks")
    object Leaderboard  : Screen("leaderboard")
    object Profile      : Screen("profile")
}
