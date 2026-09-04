package com.rapidstudy.dto.analysis;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Full performance response for GET /api/v1/student/performance (Phase 31)
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PerformanceResponse {

    // Summary stats
    private long   testsAttempted;
    private long   testsCompleted;
    private double averageScore;       // avg percentage
    private double averageAccuracy;
    private double bestScore;          // best percentage ever
    private long   totalQuestionsAttempted;
    private long   totalCorrect;
    private long   totalWrong;
    private int    currentStreak;      // consecutive days with at least 1 test
    private int    longestStreak;

    // History (last 10 attempts for chart)
    private List<ScoreHistoryDto> scoreHistory;

    // Subject-level performance across all attempts
    private List<SubjectAnalysisDto> subjectPerformance;

    // Difficulty breakdown across all attempts
    private List<DifficultyAnalysisDto> difficultyBreakdown;
}
