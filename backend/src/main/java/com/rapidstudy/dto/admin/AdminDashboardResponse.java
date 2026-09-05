package com.rapidstudy.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class AdminDashboardResponse {
    // Totals
    private long totalUsers;
    private long activeUsers;
    private long totalExams;
    private long totalQuestions;
    private long totalTests;
    private long totalAttempts;
    private long todaysAttempts;
    private long totalSubjects;
    private long totalTopics;

    // Chart data
    private List<ChartPoint> userRegistrations; // last 7 days
    private List<ChartPoint> testAttempts;       // last 7 days
    private List<ExamPopularity> popularExams;   // top 5 by attempts
    private double averageScore;                 // platform-wide avg %
}
