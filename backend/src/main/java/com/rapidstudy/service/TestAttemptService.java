package com.rapidstudy.service;

import com.rapidstudy.dto.attempt.*;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.entity.*;
import com.rapidstudy.enums.AttemptStatus;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ForbiddenException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Test Attempt Service — Phase 23, 24, 25.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  SECURITY CONTRACT (must never be violated):
 *
 *  1. Correct answers are NEVER returned during an active attempt.
 *  2. expiresAt is always set by server — client timer is display only.
 *  3. All scores are calculated exclusively on the server (Phase 28).
 *  4. Attempt ownership is enforced — userId must match on every call.
 *  5. Only published tests can be attempted.
 *  6. Duplicate in-progress attempts are rejected.
 *  7. Expired or completed attempts cannot be answered.
 *  8. selectedOptionId must belong to the question being answered.
 * ═══════════════════════════════════════════════════════════════════
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class TestAttemptService {

    private final TestAttemptRepository      attemptRepository;
    private final AttemptAnswerRepository    answerRepository;
    private final MockTestRepository         mockTestRepository;
    private final MockTestQuestionRepository mtqRepository;
    private final QuestionRepository         questionRepository;
    private final OptionRepository           optionRepository;
    private final QuestionService            questionService;

    // ──────────────────────────────────────────────────────────────────
    // Phase 23: Start attempt
    // ──────────────────────────────────────────────────────────────────

    @Transactional
    public StartAttemptResponse startAttempt(Long testId, Long userId) {

        // 1. Load and validate the test
        MockTest test = mockTestRepository.findById(testId)
                .orElseThrow(() -> new ResourceNotFoundException("Test not found: " + testId));

        if (!test.getIsPublished())
            throw new BadRequestException("Test is not published");

        // 2. Prevent duplicate in-progress attempts
        if (attemptRepository.existsByUserIdAndMockTestIdAndStatus(
                userId, testId, AttemptStatus.IN_PROGRESS))
            throw new BadRequestException(
                "You already have an active attempt for this test. " +
                "Resume it or wait for it to expire.");

        // 3. Create attempt — expiresAt is controlled entirely by server (Phase 24)
        LocalDateTime now       = LocalDateTime.now();
        LocalDateTime expiresAt = now.plusMinutes(test.getDurationMinutes());

        TestAttempt attempt = new TestAttempt();
        attempt.setUserId(userId);
        attempt.setMockTestId(testId);
        attempt.setStartedAt(now);
        attempt.setExpiresAt(expiresAt);       // Server sets expiry — never trust client
        attempt.setTotalMarks(test.getTotalMarks());
        attempt.setStatus(AttemptStatus.IN_PROGRESS);
        attempt.setCorrectAnswers(0);
        attempt.setWrongAnswers(0);
        attempt.setUnanswered(test.getTotalQuestions());

        TestAttempt saved = attemptRepository.save(attempt);
        log.info("Attempt started: attemptId={} userId={} testId={} expiresAt={}",
                saved.getId(), userId, testId, expiresAt);

        // 4. Load questions — SAFE, no correct answers
        List<QuestionSafeDto> questions = loadSafeQuestions(testId);

        return StartAttemptResponse.builder()
                .attemptId(saved.getId())
                .mockTestId(testId)
                .testTitle(test.getTitle())
                .durationMinutes(test.getDurationMinutes())
                .startedAt(now)
                .expiresAt(expiresAt)
                .questions(questions)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 23 + 25: Get attempt status (resume / palette)
    // ──────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public AttemptStatusResponse getAttemptStatus(Long attemptId, Long userId) {

        TestAttempt attempt = findAttemptForUser(attemptId, userId);

        // Auto-expire if time ran out
        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS
                && LocalDateTime.now().isAfter(attempt.getExpiresAt())) {
            // Mark expired inline — read-only tx, but we throw to trigger a reload
            throw new BadRequestException(
                "This attempt has expired. Please submit to see your result.");
        }

        MockTest test = mockTestRepository.findById(attempt.getMockTestId()).orElseThrow();
        long secondsRemaining = computeSecondsRemaining(attempt);

        // Build question state map for palette (Phase 25)
        List<MockTestQuestion> orderedQs = mtqRepository
                .findByMockTestIdOrderByQuestionOrderAsc(attempt.getMockTestId());
        Map<Long, AttemptAnswer> answerMap = answerRepository.findByAttemptId(attemptId)
                .stream().collect(Collectors.toMap(AttemptAnswer::getQuestionId, a -> a));

        List<QuestionStateDto> states = orderedQs.stream().map(mtq -> {
            Long qId = mtq.getQuestionId();
            AttemptAnswer ans = answerMap.get(qId);

            boolean hasAnswer   = ans != null && ans.getSelectedOptionId() != null;
            boolean flagged     = ans != null && Boolean.TRUE.equals(ans.getMarkedForReview());
            String  state       = deriveState(hasAnswer, flagged);

            return QuestionStateDto.builder()
                    .questionId(qId)
                    .questionOrder(mtq.getQuestionOrder())
                    .state(state)
                    .selectedOptionId(ans != null ? ans.getSelectedOptionId() : null)
                    .markedForReview(flagged)
                    .build();
        }).collect(Collectors.toList());

        return AttemptStatusResponse.builder()
                .attemptId(attemptId)
                .mockTestId(attempt.getMockTestId())
                .testTitle(test.getTitle())
                .durationMinutes(test.getDurationMinutes())
                .startedAt(attempt.getStartedAt())
                .expiresAt(attempt.getExpiresAt())
                .status(attempt.getStatus())
                .secondsRemaining(secondsRemaining)
                .questionStates(states)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 25: Save answer
    // ──────────────────────────────────────────────────────────────────

    @Transactional
    public SaveAnswerResponse saveAnswer(Long attemptId, Long questionId,
                                         SaveAnswerRequest req, Long userId) {

        TestAttempt attempt = findAttemptForUser(attemptId, userId);
        validateAttemptActive(attempt);

        // Verify question belongs to this test
        boolean qInTest = mtqRepository.existsByMockTestIdAndQuestionId(
                attempt.getMockTestId(), questionId);
        if (!qInTest)
            throw new BadRequestException("Question does not belong to this test");

        // Verify the selected option belongs to the question
        Option opt = optionRepository.findById(req.getSelectedOptionId())
                .orElseThrow(() -> new BadRequestException("Option not found"));
        if (!opt.getQuestionId().equals(questionId))
            throw new BadRequestException("Option does not belong to this question");

        // Upsert answer — never accept score/isCorrect from client
        AttemptAnswer answer = answerRepository
                .findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseGet(() -> {
                    AttemptAnswer a = new AttemptAnswer();
                    a.setAttemptId(attemptId);
                    a.setQuestionId(questionId);
                    a.setMarkedForReview(false);
                    return a;
                });

        answer.setSelectedOptionId(req.getSelectedOptionId());
        answer.setAnsweredAt(LocalDateTime.now());
        // isCorrect and marksObtained are set only during submission (Phase 28)
        answer.setIsCorrect(null);
        answer.setMarksObtained(null);

        AttemptAnswer saved = answerRepository.save(answer);

        String state = deriveState(true, Boolean.TRUE.equals(saved.getMarkedForReview()));
        return SaveAnswerResponse.builder()
                .questionId(questionId)
                .selectedOptionId(saved.getSelectedOptionId())
                .markedForReview(Boolean.TRUE.equals(saved.getMarkedForReview()))
                .state(state)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 25: Clear answer
    // ──────────────────────────────────────────────────────────────────

    @Transactional
    public void clearAnswer(Long attemptId, Long questionId, Long userId) {

        TestAttempt attempt = findAttemptForUser(attemptId, userId);
        validateAttemptActive(attempt);

        answerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .ifPresent(ans -> {
                    ans.setSelectedOptionId(null);
                    ans.setIsCorrect(null);
                    ans.setMarksObtained(null);
                    ans.setAnsweredAt(null);
                    answerRepository.save(ans);
                });
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 25: Mark / unmark for review
    // ──────────────────────────────────────────────────────────────────

    @Transactional
    public QuestionStateDto toggleReview(Long attemptId, Long questionId,
                                          boolean markForReview, Long userId) {

        TestAttempt attempt = findAttemptForUser(attemptId, userId);
        validateAttemptActive(attempt);

        boolean qInTest = mtqRepository.existsByMockTestIdAndQuestionId(
                attempt.getMockTestId(), questionId);
        if (!qInTest)
            throw new BadRequestException("Question does not belong to this test");

        AttemptAnswer answer = answerRepository
                .findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseGet(() -> {
                    AttemptAnswer a = new AttemptAnswer();
                    a.setAttemptId(attemptId);
                    a.setQuestionId(questionId);
                    return a;
                });

        answer.setMarkedForReview(markForReview);
        AttemptAnswer saved = answerRepository.save(answer);

        boolean hasAnswer = saved.getSelectedOptionId() != null;
        return QuestionStateDto.builder()
                .questionId(questionId)
                .state(deriveState(hasAnswer, markForReview))
                .selectedOptionId(saved.getSelectedOptionId())
                .markedForReview(markForReview)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 24: Server timer helpers (used by submission in Phase 28)
    // ──────────────────────────────────────────────────────────────────

    /**
     * Returns remaining seconds based on server time.
     * This is the authoritative source — frontend only displays this value.
     */
    public long computeSecondsRemaining(TestAttempt attempt) {
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) return 0;
        long remaining = ChronoUnit.SECONDS.between(LocalDateTime.now(), attempt.getExpiresAt());
        return Math.max(0, remaining);
    }

    /**
     * Returns true if the attempt has expired server-side.
     * Called during submission to auto-submit expired attempts.
     */
    public boolean isExpired(TestAttempt attempt) {
        return LocalDateTime.now().isAfter(attempt.getExpiresAt());
    }

    // ──────────────────────────────────────────────────────────────────
    // Internal helpers
    // ──────────────────────────────────────────────────────────────────

    public TestAttempt findAttemptForUser(Long attemptId, Long userId) {
        return attemptRepository.findByIdAndUserId(attemptId, userId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Attempt not found or does not belong to you"));
    }

    private void validateAttemptActive(TestAttempt attempt) {
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS)
            throw new BadRequestException("This attempt is no longer active (status: "
                    + attempt.getStatus() + ")");
        // Phase 24: server-side expiry check
        if (isExpired(attempt))
            throw new BadRequestException(
                "This attempt has expired. Please submit to see your result.");
    }

    private List<QuestionSafeDto> loadSafeQuestions(Long testId) {
        return mtqRepository.findByMockTestIdOrderByQuestionOrderAsc(testId)
                .stream()
                .map(mtq -> questionRepository.findById(mtq.getQuestionId()).orElse(null))
                .filter(q -> q != null && q.getIsActive())
                .map(questionService::toSafeDto)
                .collect(Collectors.toList());
    }

    /**
     * Derives Phase 25 question state string from answer + review flag.
     *
     * NOT_VISITED         — no answer row exists at all (handled in palette builder)
     * VISITED             — row exists, no answer, not flagged
     * ANSWERED            — has answer, not flagged
     * MARKED_FOR_REVIEW   — no answer, flagged
     * ANSWERED_AND_MARKED — has answer AND flagged
     */
    private String deriveState(boolean hasAnswer, boolean flagged) {
        if (hasAnswer  && flagged)  return "ANSWERED_AND_MARKED";
        if (hasAnswer)              return "ANSWERED";
        if (flagged)                return "MARKED_FOR_REVIEW";
        return "VISITED";
    }
}
