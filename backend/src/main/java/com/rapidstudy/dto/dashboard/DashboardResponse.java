package com.rapidstudy.dto.dashboard;

import com.rapidstudy.dto.auth.UserProfileResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Complete dashboard response returned by GET /api/v1/student/dashboard
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private UserProfileResponse          user;
    private StatsDto                     stats;
    private DailyTargetDto               dailyTarget;
    private List<RecentAttemptDto>       recentAttempts;
    private List<ExamDto>                popularExams;
    private List<MockTestDto>            upcomingTests;
    private List<SubjectPerformanceDto>  subjectPerformance;
    private List<LeaderboardEntryDto>    leaderboard;
}
