package com.rapidstudy.service;

import com.rapidstudy.dto.auth.UserProfileResponse;
import com.rapidstudy.dto.dashboard.*;
import com.rapidstudy.entity.*;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Student-facing business logic.
 * Aggregates data for the dashboard endpoint and future student APIs.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class StudentService {

    private final UserRepository               userRepository;
    private final TestAttemptRepository        attemptRepository;
    private final AttemptAnswerRepository      answerRepository;
    private final ExamRepository               examRepository;
    private final MockTestRepository           mockTestRepository;

    // ---------------------------------------------------------------
    // Dashboard
    // ---------------------------------------------------------------

    @Transactional(readOnly = true)
    public DashboardResponse getDashboard(Long userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // --- User profile ---
        UserProfileResponse profile = UserProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .profileImage(user.getProfileImage())
                .role(user.getRole())
                .language(user.getLanguage())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .build();

        // --- Stats ---
        StatsDto stats = buildStats(userId);

        // --- Daily target (fixed defaults until study plan is implemented) ---
        DailyTargetDto dailyTarget = DailyTargetDto.builder()
                .questionsTarget(20)
                .questionsDone(0)
                .testsTarget(1)
                .testsDone(0)
                .build();

        // --- Recent attempts (last 5 completed) ---
        List<RecentAttemptDto> recentAttempts = buildRecentAttempts(userId);

        // --- Popular exams (up to 6 active) ---
        List<ExamDto> popularExams = examRepository
                .findAll(PageRequest.of(0, 6))
                .stream()
                .filter(Exam::getIsActive)
                .map(this::toExamDto)
                .collect(Collectors.toList());

        // --- Upcoming published tests (up to 5) ---
        List<MockTestDto> upcomingTests = mockTestRepository
                .findAll(PageRequest.of(0, 5))
                .stream()
                .filter(MockTest::getIsPublished)
                .map(this::toMockTestDto)
                .collect(Collectors.toList());

        // --- Subject performance (empty until attempts exist) ---
        List<SubjectPerformanceDto> subjectPerformance = new ArrayList<>();

        // --- Mini leaderboard (top 5 by score, current session) ---
        List<LeaderboardEntryDto> leaderboard = buildLeaderboard(userId);

        return DashboardResponse.builder()
                .user(profile)
                .stats(stats)
                .dailyTarget(dailyTarget)
                .recentAttempts(recentAttempts)
                .popularExams(popularExams)
                .upcomingTests(upcomingTests)
                .subjectPerformance(subjectPerformance)
                .leaderboard(leaderboard)
                .build();
    }

    // ---------------------------------------------------------------
    // Private helpers
    // ---------------------------------------------------------------

    private StatsDto buildStats(Long userId) {
        long testsAttempted = attemptRepository.countByUserId(userId);
        double averageScore = 0;
        double accuracy     = 0;
        long   totalQuestions = 0;

        if (testsAttempted > 0) {
            List<TestAttempt> completed = attemptRepository
                    .findByUserIdAndStatus(userId,
                            com.rapidstudy.enums.AttemptStatus.COMPLETED,
                            PageRequest.of(0, 100))
                    .getContent();

            if (!completed.isEmpty()) {
                double totalScore = completed.stream()
                        .mapToDouble(a -> a.getScore() != null ? a.getScore().doubleValue() : 0)
                        .sum();
                double totalMarks = completed.stream()
                        .mapToDouble(a -> a.getTotalMarks() != null ? a.getTotalMarks().doubleValue() : 0)
                        .sum();
                long correct = completed.stream()
                        .mapToLong(a -> a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0)
                        .sum();
                long total = completed.stream()
                        .mapToLong(a -> {
                            int c = a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0;
                            int w = a.getWrongAnswers()   != null ? a.getWrongAnswers()   : 0;
                            int u = a.getUnanswered()     != null ? a.getUnanswered()     : 0;
                            return c + w + u;
                        })
                        .sum();

                totalQuestions = total;
                averageScore   = totalMarks > 0 ? (totalScore / totalMarks) * 100 : 0;
                accuracy       = total > 0 ? ((double) correct / total) * 100 : 0;
            }
        }

        return StatsDto.builder()
                .testsAttempted(testsAttempted)
                .averageScore(Math.round(averageScore * 10.0) / 10.0)
                .currentStreak(0)
                .totalQuestions(totalQuestions)
                .accuracy(Math.round(accuracy * 10.0) / 10.0)
                .rank(0)
                .build();
    }

    private List<RecentAttemptDto> buildRecentAttempts(Long userId) {
        return attemptRepository
                .findByUserIdAndStatus(userId,
                        com.rapidstudy.enums.AttemptStatus.COMPLETED,
                        PageRequest.of(0, 5))
                .stream()
                .map(a -> {
                    int correct    = a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0;
                    int wrong      = a.getWrongAnswers()   != null ? a.getWrongAnswers()   : 0;
                    int unanswered = a.getUnanswered()     != null ? a.getUnanswered()     : 0;
                    int total      = correct + wrong + unanswered;
                    double acc     = total > 0 ? ((double) correct / total) * 100 : 0;

                    return RecentAttemptDto.builder()
                            .id(a.getId())
                            .testTitle(a.getMockTest() != null ? a.getMockTest().getTitle() : "Test")
                            .score(a.getScore()      != null ? a.getScore().doubleValue()      : 0)
                            .totalMarks(a.getTotalMarks() != null ? a.getTotalMarks().doubleValue() : 0)
                            .accuracy(Math.round(acc * 10.0) / 10.0)
                            .submittedAt(a.getSubmittedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    private List<LeaderboardEntryDto> buildLeaderboard(Long currentUserId) {
        // Simple leaderboard based on best score across all completed attempts
        // Full Redis-backed leaderboard comes in Phase 32
        List<Object[]> topUsers = attemptRepository.findTopUsersByScore(PageRequest.of(0, 5));
        List<LeaderboardEntryDto> result = new ArrayList<>();
        int rank = 1;
        for (Object[] row : topUsers) {
            Long   uid   = ((Number) row[0]).longValue();
            String name  = (String) row[1];
            Double score = row[2] != null ? ((Number) row[2]).doubleValue() : 0.0;
            Double acc   = row[3] != null ? ((Number) row[3]).doubleValue() : 0.0;
            Long   tests = row[4] != null ? ((Number) row[4]).longValue()   : 0L;

            result.add(LeaderboardEntryDto.builder()
                    .rank(rank++)
                    .userId(uid)
                    .name(name)
                    .score(score)
                    .accuracy(Math.round(acc * 10.0) / 10.0)
                    .tests(tests.intValue())
                    .isCurrentUser(uid.equals(currentUserId))
                    .build());
        }
        return result;
    }

    private ExamDto toExamDto(Exam e) {
        return ExamDto.builder()
                .id(e.getId())
                .name(e.getName())
                .code(e.getCode())
                .description(e.getDescription())
                .logo(e.getLogo())
                .isActive(e.getIsActive())
                .build();
    }

    private MockTestDto toMockTestDto(MockTest t) {
        return MockTestDto.builder()
                .id(t.getId())
                .title(t.getTitle())
                .durationMinutes(t.getDurationMinutes())
                .totalQuestions(t.getTotalQuestions())
                .totalMarks(t.getTotalMarks() != null ? t.getTotalMarks().doubleValue() : 0)
                .negativeMarks(t.getNegativeMarks() != null ? t.getNegativeMarks().doubleValue() : 0)
                .build();
    }
}
