package com.rapidstudy.service;

import com.rapidstudy.dto.analysis.*;
import com.rapidstudy.entity.*;
import com.rapidstudy.enums.AttemptStatus;
import com.rapidstudy.enums.Difficulty;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final TestAttemptRepository      attemptRepository;
    private final AttemptAnswerRepository    answerRepository;
    private final MockTestRepository         mockTestRepository;
    private final MockTestQuestionRepository mtqRepository;
    private final QuestionRepository         questionRepository;
    private final TopicRepository            topicRepository;
    private final SubjectRepository          subjectRepository;

    // ──────────────────────────────────────────────────────────────────────
    // Phase 30: Single attempt analysis
    // ──────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AttemptAnalysisResponse getAttemptAnalysis(Long attemptId, Long userId) {

        TestAttempt attempt = attemptRepository.findByIdAndUserId(attemptId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Attempt not found"));

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS)
            throw new BadRequestException("Submit the test first to see analysis.");

        MockTest test = mockTestRepository.findById(attempt.getMockTestId()).orElseThrow();

        List<AttemptAnswer> answers = answerRepository.findByAttemptId(attemptId);
        Map<Long, AttemptAnswer> ansMap = answers.stream()
                .collect(Collectors.toMap(AttemptAnswer::getQuestionId, a -> a));

        List<MockTestQuestion> mtqs = mtqRepository
                .findByMockTestIdOrderByQuestionOrderAsc(attempt.getMockTestId());

        Map<String, SubjectBucket>    subjectMap    = new LinkedHashMap<>();
        Map<String, TopicBucket>      topicMap      = new LinkedHashMap<>();
        Map<String, DifficultyBucket> difficultyMap = new LinkedHashMap<>();
        for (Difficulty d : Difficulty.values())
            difficultyMap.put(d.name(), new DifficultyBucket(d.name()));

        for (MockTestQuestion mtq : mtqs) {
            Question q = questionRepository.findById(mtq.getQuestionId()).orElse(null);
            if (q == null) continue;

            Topic   topic   = q.getTopic();
            Subject subject = topic != null ? topic.getSubject() : null;
            String topicName   = topic   != null ? topic.getName()   : "Unknown";
            String subjectName = subject != null ? subject.getName() : "Unknown";
            String diffName    = q.getDifficulty() != null ? q.getDifficulty().name() : "MEDIUM";

            AttemptAnswer ans = ansMap.get(q.getId());
            boolean answered  = ans != null && ans.getSelectedOptionId() != null;
            boolean correct   = ans != null && Boolean.TRUE.equals(ans.getIsCorrect());
            double marks = ans != null && ans.getMarksObtained() != null
                    ? ans.getMarksObtained().doubleValue() : 0;

            subjectMap.computeIfAbsent(subjectName, SubjectBucket::new)
                      .add(correct, answered, marks, q.getMarks().doubleValue());
            topicMap.computeIfAbsent(subjectName + "::" + topicName,
                    k -> new TopicBucket(topicName, subjectName))
                    .add(correct, answered);
            difficultyMap.computeIfAbsent(diffName, DifficultyBucket::new)
                         .add(correct, answered);
        }

        int totalDurationSec = test.getDurationMinutes() * 60;
        int timeTaken = attempt.getTimeTakenSeconds() != null ? attempt.getTimeTakenSeconds() : 0;
        int attempted = attempt.getCorrectAnswers() + attempt.getWrongAnswers();
        double avgSec = attempted > 0 ? (double) timeTaken / attempted : 0;

        BigDecimal totalMarks = attempt.getTotalMarks();
        double pct = totalMarks != null && totalMarks.compareTo(BigDecimal.ZERO) > 0
                && attempt.getScore() != null
                ? attempt.getScore().divide(totalMarks, 4, RoundingMode.HALF_UP)
                         .multiply(BigDecimal.valueOf(100)).doubleValue() : 0;
        double acc = attempted > 0 ? (double) attempt.getCorrectAnswers() / attempted * 100 : 0;

        return AttemptAnalysisResponse.builder()
                .attemptId(attemptId)
                .testTitle(test.getTitle())
                .score(attempt.getScore())
                .totalMarks(totalMarks)
                .percentage(round(pct))
                .accuracy(round(acc))
                .correctAnswers(attempt.getCorrectAnswers())
                .wrongAnswers(attempt.getWrongAnswers())
                .unanswered(attempt.getUnanswered())
                .subjectAnalysis(subjectMap.values().stream().map(SubjectBucket::toDto).collect(Collectors.toList()))
                .topicAnalysis(topicMap.values().stream().map(TopicBucket::toDto).collect(Collectors.toList()))
                .difficultyAnalysis(difficultyMap.values().stream().map(DifficultyBucket::toDto).collect(Collectors.toList()))
                .timeAnalysis(TimeAnalysisDto.builder()
                        .totalDurationSeconds(totalDurationSec).timeTakenSeconds(timeTaken)
                        .timeRemainingSeconds(Math.max(0, totalDurationSec - timeTaken))
                        .avgSecondsPerQuestion(round(avgSec))
                        .questionsAttempted(attempted).questionsSkipped(attempt.getUnanswered())
                        .build())
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────
    // Phase 31: Overall performance across all attempts
    // ──────────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public PerformanceResponse getPerformance(Long userId) {

        List<TestAttempt> completed = attemptRepository
                .findByUserIdAndStatus(userId, AttemptStatus.COMPLETED,
                        PageRequest.of(0, 1000, Sort.by(Sort.Direction.DESC, "submittedAt")))
                .getContent();

        long testsAttempted = attemptRepository.countByUserId(userId);

        if (completed.isEmpty()) {
            return PerformanceResponse.builder()
                    .testsAttempted(testsAttempted).testsCompleted(0)
                    .averageScore(0).averageAccuracy(0).bestScore(0)
                    .totalQuestionsAttempted(0).totalCorrect(0).totalWrong(0)
                    .currentStreak(0).longestStreak(0)
                    .scoreHistory(Collections.emptyList())
                    .subjectPerformance(Collections.emptyList())
                    .difficultyBreakdown(Collections.emptyList())
                    .build();
        }

        // Score history (last 10 for chart)
        List<ScoreHistoryDto> history = completed.stream().limit(10).map(a -> {
            BigDecimal tm = a.getTotalMarks();
            double pct = tm != null && tm.compareTo(BigDecimal.ZERO) > 0 && a.getScore() != null
                    ? a.getScore().divide(tm, 4, RoundingMode.HALF_UP)
                       .multiply(BigDecimal.valueOf(100)).doubleValue() : 0;
            int c = a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0;
            int w = a.getWrongAnswers()   != null ? a.getWrongAnswers()   : 0;
            double acc = (c + w) > 0 ? (double) c / (c + w) * 100 : 0;
            MockTest mt = mockTestRepository.findById(a.getMockTestId()).orElse(null);
            return ScoreHistoryDto.builder()
                    .attemptId(a.getId())
                    .testTitle(mt != null ? mt.getTitle() : "Test")
                    .score(a.getScore() != null ? a.getScore().doubleValue() : 0)
                    .totalMarks(tm != null ? tm.doubleValue() : 0)
                    .percentage(round(pct)).accuracy(round(acc))
                    .submittedAt(a.getSubmittedAt())
                    .build();
        }).collect(Collectors.toList());

        // Aggregates
        double totalScore = 0, totalPossible = 0;
        long totalCorrect = 0, totalWrong = 0, totalQAttempted = 0;
        double bestScore = 0;

        for (TestAttempt a : completed) {
            if (a.getScore() != null)      totalScore    += a.getScore().doubleValue();
            if (a.getTotalMarks() != null) totalPossible += a.getTotalMarks().doubleValue();
            if (a.getCorrectAnswers() != null) totalCorrect += a.getCorrectAnswers();
            if (a.getWrongAnswers()   != null) totalWrong   += a.getWrongAnswers();
            totalQAttempted += (a.getCorrectAnswers() != null ? a.getCorrectAnswers() : 0)
                             + (a.getWrongAnswers()   != null ? a.getWrongAnswers()   : 0);

            BigDecimal tm = a.getTotalMarks();
            if (tm != null && tm.compareTo(BigDecimal.ZERO) > 0 && a.getScore() != null) {
                double pct = a.getScore().divide(tm, 4, RoundingMode.HALF_UP)
                               .multiply(BigDecimal.valueOf(100)).doubleValue();
                if (pct > bestScore) bestScore = pct;
            }
        }

        double avgScore = totalPossible > 0 ? totalScore / totalPossible * 100 : 0;
        double avgAcc   = totalQAttempted > 0 ? (double) totalCorrect / totalQAttempted * 100 : 0;

        // Streak calculation — consecutive days with at least one completed attempt
        int[] streaks = computeStreaks(completed);

        // Subject performance across all attempts (simplified — use dashboard data)
        List<SubjectAnalysisDto> subjectPerf = Collections.emptyList();
        List<DifficultyAnalysisDto> diffBreakdown = buildGlobalDifficultyBreakdown(completed);

        return PerformanceResponse.builder()
                .testsAttempted(testsAttempted)
                .testsCompleted(completed.size())
                .averageScore(round(avgScore))
                .averageAccuracy(round(avgAcc))
                .bestScore(round(bestScore))
                .totalQuestionsAttempted(totalQAttempted)
                .totalCorrect(totalCorrect)
                .totalWrong(totalWrong)
                .currentStreak(streaks[0])
                .longestStreak(streaks[1])
                .scoreHistory(history)
                .subjectPerformance(subjectPerf)
                .difficultyBreakdown(diffBreakdown)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────────
    // Private helpers
    // ──────────────────────────────────────────────────────────────────────

    /** Returns [currentStreak, longestStreak] in days */
    private int[] computeStreaks(List<TestAttempt> completed) {
        // Group by date
        Set<LocalDate> activeDays = completed.stream()
                .filter(a -> a.getSubmittedAt() != null)
                .map(a -> a.getSubmittedAt().toLocalDate())
                .collect(Collectors.toSet());

        if (activeDays.isEmpty()) return new int[]{0, 0};

        LocalDate today = LocalDate.now();
        int current = 0;
        LocalDate check = today;
        while (activeDays.contains(check)) { current++; check = check.minusDays(1); }

        // If no test today, check if yesterday breaks streak
        if (!activeDays.contains(today)) {
            current = 0;
            check = today.minusDays(1);
            while (activeDays.contains(check)) { current++; check = check.minusDays(1); }
        }

        // Longest streak
        List<LocalDate> sorted = new ArrayList<>(activeDays);
        Collections.sort(sorted);
        int longest = 1, cur = 1;
        for (int i = 1; i < sorted.size(); i++) {
            if (sorted.get(i).equals(sorted.get(i - 1).plusDays(1))) {
                cur++;
                longest = Math.max(longest, cur);
            } else {
                cur = 1;
            }
        }

        return new int[]{current, longest};
    }

    private List<DifficultyAnalysisDto> buildGlobalDifficultyBreakdown(List<TestAttempt> completed) {
        Map<String, DifficultyBucket> map = new LinkedHashMap<>();
        for (Difficulty d : Difficulty.values()) map.put(d.name(), new DifficultyBucket(d.name()));

        for (TestAttempt a : completed) {
            List<AttemptAnswer> answers = answerRepository.findByAttemptId(a.getId());
            for (AttemptAnswer ans : answers) {
                Question q = questionRepository.findById(ans.getQuestionId()).orElse(null);
                if (q == null) continue;
                String diffName = q.getDifficulty() != null ? q.getDifficulty().name() : "MEDIUM";
                boolean answered = ans.getSelectedOptionId() != null;
                boolean correct  = Boolean.TRUE.equals(ans.getIsCorrect());
                map.computeIfAbsent(diffName, DifficultyBucket::new).add(correct, answered);
            }
        }
        return map.values().stream().map(DifficultyBucket::toDto).collect(Collectors.toList());
    }

    private double round(double v) { return Math.round(v * 100.0) / 100.0; }

    // ──────────────────────────────────────────────────────────────────────
    // Inner bucket classes for aggregation
    // ──────────────────────────────────────────────────────────────────────

    private static class SubjectBucket {
        String name; int total, correct, wrong; double score, possible;
        SubjectBucket(String n) { this.name = n; }
        void add(boolean correct, boolean answered, double marks, double maxMarks) {
            total++; possible += maxMarks; score += marks;
            if (answered) { if (correct) this.correct++; else wrong++; }
        }
        SubjectAnalysisDto toDto() {
            int skipped = total - correct - wrong;
            int attempted = correct + wrong;
            double acc = attempted > 0 ? (double) correct / attempted * 100 : 0;
            return SubjectAnalysisDto.builder()
                    .subjectName(name).total(total).correct(correct).wrong(wrong).skipped(skipped)
                    .accuracy(Math.round(acc * 100.0) / 100.0)
                    .scoreObtained(Math.round(score * 100.0) / 100.0)
                    .totalMarks(Math.round(possible * 100.0) / 100.0)
                    .build();
        }
    }

    private static class TopicBucket {
        String topicName, subjectName; int total, correct, wrong;
        TopicBucket(String t, String s) { topicName = t; subjectName = s; }
        void add(boolean correct, boolean answered) {
            total++;
            if (answered) { if (correct) this.correct++; else wrong++; }
        }
        TopicAnalysisDto toDto() {
            int skipped = total - correct - wrong;
            int attempted = correct + wrong;
            double acc = attempted > 0 ? (double) correct / attempted * 100 : 0;
            return TopicAnalysisDto.builder()
                    .topicName(topicName).subjectName(subjectName)
                    .total(total).correct(correct).wrong(wrong).skipped(skipped)
                    .accuracy(Math.round(acc * 100.0) / 100.0)
                    .build();
        }
    }

    private static class DifficultyBucket {
        String name; int total, correct, wrong;
        DifficultyBucket(String n) { this.name = n; }
        void add(boolean correct, boolean answered) {
            total++;
            if (answered) { if (correct) this.correct++; else wrong++; }
        }
        DifficultyAnalysisDto toDto() {
            int skipped = total - correct - wrong;
            int attempted = correct + wrong;
            double acc = attempted > 0 ? (double) correct / attempted * 100 : 0;
            return DifficultyAnalysisDto.builder()
                    .difficulty(name).total(total).correct(correct).wrong(wrong).skipped(skipped)
                    .accuracy(Math.round(acc * 100.0) / 100.0)
                    .build();
        }
    }
}
