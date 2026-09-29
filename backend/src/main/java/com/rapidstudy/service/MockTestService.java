package com.rapidstudy.service;

import com.rapidstudy.dto.mocktest.*;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.entity.MockTest;
import com.rapidstudy.entity.MockTestQuestion;
import com.rapidstudy.entity.Question;
import com.rapidstudy.entity.Subject;
import com.rapidstudy.entity.TestAttempt;
import com.rapidstudy.entity.Topic;
import com.rapidstudy.enums.AttemptStatus;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ConflictException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Mock Test service — Phase 20, 21, 22.
 *
 * Handles:
 * - Admin CRUD for mock tests
 * - Adding/removing questions (manual, random, topic/difficulty-based)
 * - Publish / Unpublish
 * - Student listing (published only)
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MockTestService {

    private final MockTestRepository         mockTestRepository;
    private final MockTestQuestionRepository mtqRepository;
    private final ExamRepository             examRepository;
    private final QuestionRepository         questionRepository;
    private final QuestionService            questionService;
    private final TestAttemptRepository      attemptRepository;
    private final TopicRepository            topicRepository;
    private final SubjectRepository          subjectRepository;

    // ──────────────────────────────────────────────────────────────────
    // Phase 21: Student listing
    // ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<MockTestDto> getPublishedTests(Long examId, String search, Pageable pageable) {
        return mockTestRepository
                .findPublishedFiltered(examId, nullIfBlank(search), pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "test_metadata", key = "#id")
    public MockTestDto getPublishedById(Long id) {
        MockTest t = mockTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found: " + id));
        if (!t.getIsPublished())
            throw new ResourceNotFoundException("Test not found: " + id);
        return toDto(t);
    }

    /** Returns the questions for a test (safe — no correct answers) */
    @Transactional(readOnly = true)
    public List<QuestionSafeDto> getTestQuestions(Long testId) {
        MockTest test = mockTestRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found: " + testId));
        if (!test.getIsPublished())
            throw new ResourceNotFoundException("Test not found: " + testId);

        return mtqRepository.findByMockTestIdOrderByQuestionOrderAsc(testId)
                .stream()
                .map(mtq -> questionRepository.findById(mtq.getQuestionId()).orElse(null))
                .filter(q -> q != null && q.getIsActive())
                .map(questionService::toSafeDto)
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 20: Admin CRUD
    // ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<MockTestDto> adminListTests(Long examId, String search, Pageable pageable) {
        return mockTestRepository
                .findAllFiltered(examId, nullIfBlank(search), pageable)
                .map(this::toDto);
    }

    @Transactional
    public MockTestDto createTest(MockTestRequest req) {
        examRepository.findById(req.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + req.getExamId()));

        MockTest t = new MockTest();
        applyRequest(t, req);
        MockTest saved = mockTestRepository.save(t);
        log.info("Admin created mock test id={} title={}", saved.getId(), saved.getTitle());
        return toDto(saved);
    }

    @Transactional
    public MockTestDto updateTest(Long id, MockTestRequest req) {
        MockTest t = findOrThrow(id);
        if (t.getIsPublished())
            throw new BadRequestException("Cannot edit a published test. Unpublish it first.");
        applyRequest(t, req);
        return toDto(mockTestRepository.save(t));
    }

    @Transactional
    public void deleteTest(Long id) {
        MockTest t = findOrThrow(id);
        if (t.getIsPublished())
            throw new BadRequestException("Cannot delete a published test. Unpublish it first.");
        mtqRepository.deleteByMockTestId(id);
        mockTestRepository.delete(t);
        log.info("Admin deleted mock test id={}", id);
    }

    @Transactional
    @CacheEvict(value = "test_metadata", key = "#id")
    public MockTestDto publishTest(Long id) {
        MockTest t = findOrThrow(id);
        long qCount = mtqRepository.countByMockTestId(id);
        if (qCount == 0)
            throw new BadRequestException("Cannot publish a test with no questions.");
        t.setIsPublished(true);
        log.info("Admin published mock test id={}", id);
        return toDto(mockTestRepository.save(t));
    }

    @Transactional
    public MockTestDto unpublishTest(Long id) {
        MockTest t = findOrThrow(id);
        t.setIsPublished(false);
        log.info("Admin unpublished mock test id={}", id);
        return toDto(mockTestRepository.save(t));
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 20: Question management in a test
    // ──────────────────────────────────────────────────────────────────

    @Transactional
    public MockTestDto addQuestions(Long testId, AddQuestionsRequest req) {
        MockTest test = findOrThrow(testId);
        if (test.getIsPublished())
            throw new BadRequestException("Unpublish the test before modifying questions.");

        List<Long> questionIds = resolveQuestions(req, testId);
        int order = (int) mtqRepository.countByMockTestId(testId);

        for (Long qId : questionIds) {
            if (mtqRepository.existsByMockTestIdAndQuestionId(testId, qId)) continue;
            MockTestQuestion mtq = new MockTestQuestion();
            mtq.setMockTestId(testId);
            mtq.setQuestionId(qId);
            mtq.setQuestionOrder(++order);
            mtqRepository.save(mtq);
        }

        // Sync totalQuestions
        test.setTotalQuestions((int) mtqRepository.countByMockTestId(testId));
        return toDto(mockTestRepository.save(test));
    }

    @Transactional
    public MockTestDto removeQuestion(Long testId, Long questionId) {
        MockTest test = findOrThrow(testId);
        if (test.getIsPublished())
            throw new BadRequestException("Unpublish the test before modifying questions.");

        List<MockTestQuestion> list = mtqRepository
                .findByMockTestIdOrderByQuestionOrderAsc(testId);
        list.stream()
                .filter(m -> m.getQuestionId().equals(questionId))
                .findFirst()
                .ifPresent(mtqRepository::delete);

        // Re-sequence order
        List<MockTestQuestion> remaining = mtqRepository
                .findByMockTestIdOrderByQuestionOrderAsc(testId);
        for (int i = 0; i < remaining.size(); i++) {
            remaining.get(i).setQuestionOrder(i + 1);
        }
        mtqRepository.saveAll(remaining);

        test.setTotalQuestions(remaining.size());
        return toDto(mockTestRepository.save(test));
    }

    /** Admin: full question list for a test (WITH correct answers) */
    @Transactional(readOnly = true)
    public List<com.rapidstudy.dto.question.QuestionDto> getAdminTestQuestions(Long testId) {
        findOrThrow(testId);
        return mtqRepository.findByMockTestIdOrderByQuestionOrderAsc(testId)
                .stream()
                .map(mtq -> questionRepository.findById(mtq.getQuestionId()).orElse(null))
                .filter(q -> q != null)
                .map(q -> questionService.toDto(q, true))
                .collect(Collectors.toList());
    }

    // ──────────────────────────────────────────────────────────────────
    // Helpers
    // ──────────────────────────────────────────────────────────────────

    private List<Long> resolveQuestions(AddQuestionsRequest req, Long testId) {
        switch (req.getMode()) {
            case MANUAL:
                if (req.getQuestionIds() == null || req.getQuestionIds().isEmpty())
                    throw new BadRequestException("MANUAL mode requires questionIds");
                return req.getQuestionIds();

            case RANDOM:
            case TOPIC_BASED:
            case DIFFICULTY_BASED: {
                if (req.getTopicId() == null)
                    throw new BadRequestException(req.getMode() + " mode requires topicId");
                int count = req.getCount() != null ? req.getCount() : 10;
                return questionRepository
                        .findRandomByTopicAndDifficulty(
                                req.getTopicId(), req.getDifficulty(),
                                PageRequest.of(0, count))
                        .stream().map(Question::getId).collect(Collectors.toList());
            }
            default:
                throw new BadRequestException("Unknown selection mode");
        }
    }

    private MockTest findOrThrow(Long id) {
        return mockTestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Mock test not found: " + id));
    }

    private void applyRequest(MockTest t, MockTestRequest req) {
        t.setExamId(req.getExamId());
        t.setTitle(req.getTitle());
        t.setDescription(req.getDescription());
        t.setDurationMinutes(req.getDurationMinutes());
        t.setTotalQuestions(req.getTotalQuestions());
        t.setTotalMarks(req.getTotalMarks());
        t.setNegativeMarks(req.getNegativeMarks() != null
                ? req.getNegativeMarks() : java.math.BigDecimal.ZERO);
        if (req.getPaperType() != null) t.setPaperType(req.getPaperType());
        t.setPaperYear(req.getPaperYear());
        t.setLiveStartsAt(req.getLiveStartsAt());
        t.setLiveEndsAt(req.getLiveEndsAt());
    }

    public MockTestDto toDto(MockTest t) {
        String examName = (t.getExam() != null) ? t.getExam().getName() : null;
        if (examName == null) {
            examName = examRepository.findById(t.getExamId())
                    .map(e -> e.getName()).orElse(null);
        }

        LocalDateTime now = LocalDateTime.now();
        boolean isLive = false;
        String liveStatus = "REGULAR";
        if (t.getLiveStartsAt() != null) {
            if (now.isBefore(t.getLiveStartsAt())) {
                liveStatus = "UPCOMING";
            } else if (t.getLiveEndsAt() == null || now.isBefore(t.getLiveEndsAt())) {
                isLive = true;
                liveStatus = "LIVE";
            } else {
                liveStatus = "ENDED";
            }
        }

        return MockTestDto.builder()
                .id(t.getId()).examId(t.getExamId()).examName(examName)
                .title(t.getTitle()).description(t.getDescription())
                .durationMinutes(t.getDurationMinutes())
                .totalQuestions(t.getTotalQuestions())
                .totalMarks(t.getTotalMarks()).negativeMarks(t.getNegativeMarks())
                .isPublished(t.getIsPublished())
                .paperType(t.getPaperType())
                .paperYear(t.getPaperYear())
                .liveStartsAt(t.getLiveStartsAt())
                .liveEndsAt(t.getLiveEndsAt())
                .isLive(isLive)
                .liveStatus(liveStatus)
                .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt())
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // 🏆 Test-Specific Leaderboard & Percentile
    // ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public TestLeaderboardDto getTestLeaderboard(Long testId, Long currentUserId) {
        MockTest test = findOrThrow(testId);
        List<TestAttempt> completed = attemptRepository.findByMockTestIdAndStatus(testId, AttemptStatus.COMPLETED);

        Map<Long, TestAttempt> bestByUser = new HashMap<>();
        for (TestAttempt a : completed) {
            Long uId = a.getUserId();
            if (!bestByUser.containsKey(uId)) {
                bestByUser.put(uId, a);
            } else {
                TestAttempt existing = bestByUser.get(uId);
                BigDecimal newScore = a.getScore() != null ? a.getScore() : BigDecimal.ZERO;
                BigDecimal oldScore = existing.getScore() != null ? existing.getScore() : BigDecimal.ZERO;
                if (newScore.compareTo(oldScore) > 0 ||
                    (newScore.compareTo(oldScore) == 0 && (a.getTimeTakenSeconds() != null && (existing.getTimeTakenSeconds() == null || a.getTimeTakenSeconds() < existing.getTimeTakenSeconds())))) {
                    bestByUser.put(uId, a);
                }
            }
        }

        List<TestAttempt> sorted = new ArrayList<>(bestByUser.values());
        sorted.sort((a, b) -> {
            BigDecimal scoreA = a.getScore() != null ? a.getScore() : BigDecimal.ZERO;
            BigDecimal scoreB = b.getScore() != null ? b.getScore() : BigDecimal.ZERO;
            int cmp = scoreB.compareTo(scoreA);
            if (cmp != 0) return cmp;
            int timeA = a.getTimeTakenSeconds() != null ? a.getTimeTakenSeconds() : Integer.MAX_VALUE;
            int timeB = b.getTimeTakenSeconds() != null ? b.getTimeTakenSeconds() : Integer.MAX_VALUE;
            return Integer.compare(timeA, timeB);
        });

        long totalParticipants = sorted.size();
        BigDecimal highestScore = sorted.isEmpty() ? BigDecimal.ZERO : (sorted.get(0).getScore() != null ? sorted.get(0).getScore() : BigDecimal.ZERO);
        BigDecimal averageScore = BigDecimal.ZERO;
        double avgAcc = 0.0;
        if (!sorted.isEmpty()) {
            double totalScoreSum = sorted.stream().mapToDouble(a -> a.getScore() != null ? a.getScore().doubleValue() : 0.0).sum();
            averageScore = BigDecimal.valueOf(totalScoreSum / totalParticipants).setScale(2, RoundingMode.HALF_UP);
            avgAcc = sorted.stream().mapToDouble(a -> {
                int total = a.getCorrectAnswers() + a.getWrongAnswers() + a.getUnanswered();
                return total > 0 ? (a.getCorrectAnswers() * 100.0) / total : 0.0;
            }).average().orElse(0.0);
        }

        Integer myRank = null;
        BigDecimal myScore = null;
        Double myAccuracy = null;
        Integer myTimeTakenSeconds = null;
        Double myPercentile = null;

        List<TestRankEntryDto> rankings = new ArrayList<>();
        for (int i = 0; i < sorted.size(); i++) {
            TestAttempt a = sorted.get(i);
            int rank = i + 1;
            int totalQ = a.getCorrectAnswers() + a.getWrongAnswers() + a.getUnanswered();
            double acc = totalQ > 0 ? Math.round(((a.getCorrectAnswers() * 100.0) / totalQ) * 10.0) / 10.0 : 0.0;

            if (currentUserId != null && a.getUserId().equals(currentUserId)) {
                myRank = rank;
                myScore = a.getScore();
                myAccuracy = acc;
                myTimeTakenSeconds = a.getTimeTakenSeconds();
                myPercentile = totalParticipants > 1
                        ? Math.round((((double)(totalParticipants - myRank + 1) / totalParticipants) * 100.0) * 10.0) / 10.0
                        : 100.0;
            }

            if (rank <= 50) {
                String uName = a.getUser() != null ? a.getUser().getName() : "Candidate " + a.getUserId();
                String pImg = a.getUser() != null ? a.getUser().getProfileImage() : null;
                rankings.add(TestRankEntryDto.builder()
                        .rank(rank)
                        .userId(a.getUserId())
                        .userName(uName)
                        .profileImage(pImg)
                        .score(a.getScore())
                        .totalMarks(a.getTotalMarks())
                        .accuracy(acc)
                        .correctAnswers(a.getCorrectAnswers())
                        .wrongAnswers(a.getWrongAnswers())
                        .timeTakenSeconds(a.getTimeTakenSeconds())
                        .completedAt(a.getSubmittedAt())
                        .build());
            }
        }

        return TestLeaderboardDto.builder()
                .testId(testId)
                .testTitle(test.getTitle())
                .totalMarks(test.getTotalMarks())
                .totalParticipants(totalParticipants)
                .highestScore(highestScore)
                .averageScore(averageScore)
                .averageAccuracy(Math.round(avgAcc * 10.0) / 10.0)
                .myRank(myRank)
                .myScore(myScore)
                .myAccuracy(myAccuracy)
                .myTimeTakenSeconds(myTimeTakenSeconds)
                .myPercentile(myPercentile)
                .rankings(rankings)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // 📊 Student Attempt Status on Test Cards
    // ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public UserTestStatusDto getUserTestStatus(Long testId, Long userId) {
        if (userId == null) {
            return UserTestStatusDto.builder().testId(testId).attempted(false).status("NOT_STARTED").totalAttemptsCount(0).build();
        }
        List<TestAttempt> attempts = attemptRepository.findByUserIdAndMockTestId(userId, testId);
        if (attempts.isEmpty()) {
            return UserTestStatusDto.builder().testId(testId).attempted(false).status("NOT_STARTED").totalAttemptsCount(0).build();
        }

        LocalDateTime now = LocalDateTime.now();
        Optional<TestAttempt> active = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.IN_PROGRESS && a.getExpiresAt().isAfter(now))
                .findFirst();

        List<TestAttempt> completed = attempts.stream()
                .filter(a -> a.getStatus() == AttemptStatus.COMPLETED)
                .sorted((a, b) -> (b.getScore() != null ? b.getScore() : BigDecimal.ZERO)
                        .compareTo(a.getScore() != null ? a.getScore() : BigDecimal.ZERO))
                .toList();

        TestAttempt latest = attempts.stream()
                .max(Comparator.comparing(TestAttempt::getStartedAt))
                .orElse(null);

        String status = active.isPresent() ? "IN_PROGRESS" : (!completed.isEmpty() ? "COMPLETED" : "ATTEMPTED");
        BigDecimal bestScore = !completed.isEmpty() ? completed.get(0).getScore() : null;
        BigDecimal totalMarks = !completed.isEmpty() ? completed.get(0).getTotalMarks() : null;
        Double bestAcc = null;
        if (!completed.isEmpty()) {
            TestAttempt b = completed.get(0);
            int tot = b.getCorrectAnswers() + b.getWrongAnswers() + b.getUnanswered();
            bestAcc = tot > 0 ? Math.round(((b.getCorrectAnswers() * 100.0) / tot) * 10.0) / 10.0 : 0.0;
        }

        return UserTestStatusDto.builder()
                .testId(testId)
                .attempted(true)
                .status(status)
                .activeAttemptId(active.map(TestAttempt::getId).orElse(null))
                .lastAttemptId(latest != null ? latest.getId() : null)
                .bestScore(bestScore)
                .totalMarks(totalMarks)
                .bestAccuracy(bestAcc)
                .totalAttemptsCount(attempts.size())
                .lastAttemptedAt(latest != null ? latest.getStartedAt() : null)
                .build();
    }

    @Transactional(readOnly = true)
    public Map<Long, UserTestStatusDto> getAllUserTestStatuses(Long userId) {
        if (userId == null) return Collections.emptyMap();
        List<TestAttempt> allAttempts = attemptRepository.findByUserId(userId);
        Map<Long, List<TestAttempt>> byTest = allAttempts.stream()
                .collect(Collectors.groupingBy(TestAttempt::getMockTestId));

        Map<Long, UserTestStatusDto> result = new HashMap<>();
        LocalDateTime now = LocalDateTime.now();

        for (Map.Entry<Long, List<TestAttempt>> entry : byTest.entrySet()) {
            Long testId = entry.getKey();
            List<TestAttempt> attempts = entry.getValue();

            Optional<TestAttempt> active = attempts.stream()
                    .filter(a -> a.getStatus() == AttemptStatus.IN_PROGRESS && a.getExpiresAt().isAfter(now))
                    .findFirst();

            List<TestAttempt> completed = attempts.stream()
                    .filter(a -> a.getStatus() == AttemptStatus.COMPLETED)
                    .sorted((a, b) -> (b.getScore() != null ? b.getScore() : BigDecimal.ZERO)
                            .compareTo(a.getScore() != null ? a.getScore() : BigDecimal.ZERO))
                    .toList();

            TestAttempt latest = attempts.stream()
                    .max(Comparator.comparing(TestAttempt::getStartedAt))
                    .orElse(null);

            String status = active.isPresent() ? "IN_PROGRESS" : (!completed.isEmpty() ? "COMPLETED" : "ATTEMPTED");
            BigDecimal bestScore = !completed.isEmpty() ? completed.get(0).getScore() : null;
            BigDecimal totalMarks = !completed.isEmpty() ? completed.get(0).getTotalMarks() : null;
            Double bestAcc = null;
            if (!completed.isEmpty()) {
                TestAttempt b = completed.get(0);
                int tot = b.getCorrectAnswers() + b.getWrongAnswers() + b.getUnanswered();
                bestAcc = tot > 0 ? Math.round(((b.getCorrectAnswers() * 100.0) / tot) * 10.0) / 10.0 : 0.0;
            }

            result.put(testId, UserTestStatusDto.builder()
                    .testId(testId)
                    .attempted(true)
                    .status(status)
                    .activeAttemptId(active.map(TestAttempt::getId).orElse(null))
                    .lastAttemptId(latest != null ? latest.getId() : null)
                    .bestScore(bestScore)
                    .totalMarks(totalMarks)
                    .bestAccuracy(bestAcc)
                    .totalAttemptsCount(attempts.size())
                    .lastAttemptedAt(latest != null ? latest.getStartedAt() : null)
                    .build());
        }
        return result;
    }

    // ──────────────────────────────────────────────────────────────────
    // 📑 Section-wise / Subject-wise Test Breakdown
    // ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<TestSectionDto> getTestSections(Long testId) {
        findOrThrow(testId);
        List<MockTestQuestion> mtqs = mtqRepository.findByMockTestIdOrderByQuestionOrderAsc(testId);
        Map<Long, List<Question>> questionsBySubject = new LinkedHashMap<>();

        for (MockTestQuestion mtq : mtqs) {
            Question q = questionRepository.findById(mtq.getQuestionId()).orElse(null);
            if (q == null || !q.getIsActive()) continue;

            Long subjectId = 0L;
            if (q.getTopic() != null) {
                subjectId = q.getTopic().getSubjectId();
            } else if (q.getTopicId() != null) {
                subjectId = topicRepository.findById(q.getTopicId())
                        .map(Topic::getSubjectId).orElse(0L);
            }
            questionsBySubject.computeIfAbsent(subjectId, k -> new ArrayList<>()).add(q);
        }

        List<TestSectionDto> sections = new ArrayList<>();
        for (Map.Entry<Long, List<Question>> entry : questionsBySubject.entrySet()) {
            Long subId = entry.getKey();
            List<Question> qList = entry.getValue();
            String secName = (subId != null && subId > 0)
                    ? subjectRepository.findById(subId).map(Subject::getName).orElse("General Section")
                    : "General Section";

            BigDecimal marksSum = qList.stream()
                    .map(q -> q.getMarks() != null ? q.getMarks() : BigDecimal.ONE)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            List<Long> qIds = qList.stream().map(Question::getId).toList();

            sections.add(TestSectionDto.builder()
                    .subjectId(subId)
                    .sectionName(secName)
                    .questionCount(qList.size())
                    .totalMarks(marksSum)
                    .questionIds(qIds)
                    .build());
        }
        return sections;
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
