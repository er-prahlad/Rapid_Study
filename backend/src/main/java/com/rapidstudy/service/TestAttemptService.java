package com.rapidstudy.service;

import com.rapidstudy.dto.attempt.*;
import com.rapidstudy.dto.question.OptionDto;
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

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
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
    // Phase 28: Submit attempt + server-side scoring
    // ──────────────────────────────────────────────────────────────────

    /**
     * Submits the attempt and calculates the score entirely on the server.
     *
     * SECURITY RULES:
     * - isCorrect determined by comparing selectedOptionId with the correct
     *   option from the database — never from any client input.
     * - marksObtained calculated using the question's marks/negativeMarks
     *   from the database, not from client.
     * - Duplicate submission prevented by checking status.
     * - Expired attempts are auto-submitted with ABANDONED status.
     * - Everything wrapped in a single @Transactional to prevent partial writes.
     */
    @Transactional
    public SubmitResponse submitAttempt(Long attemptId, Long userId) {

        TestAttempt attempt = findAttemptForUser(attemptId, userId);

        // Prevent duplicate submission
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS)
            throw new BadRequestException(
                "Attempt already " + attempt.getStatus().name().toLowerCase());

        boolean wasExpired = isExpired(attempt);
        LocalDateTime submittedAt = LocalDateTime.now();

        // Load all answers
        List<AttemptAnswer> answers = answerRepository.findByAttemptId(attemptId);
        Map<Long, AttemptAnswer> answerByQuestionId = answers.stream()
                .collect(Collectors.toMap(AttemptAnswer::getQuestionId, a -> a));

        // Load all questions in this test
        List<MockTestQuestion> mtqs = mtqRepository
                .findByMockTestIdOrderByQuestionOrderAsc(attempt.getMockTestId());

        int correct = 0, wrong = 0, unanswered = 0;
        BigDecimal totalScore = BigDecimal.ZERO;

        for (MockTestQuestion mtq : mtqs) {
            Long qId = mtq.getQuestionId();
            Question q = questionRepository.findById(qId).orElse(null);
            if (q == null) continue;

            AttemptAnswer ans = answerByQuestionId.get(qId);

            if (ans == null || ans.getSelectedOptionId() == null) {
                // Not answered — no marks, no penalty
                unanswered++;
                if (ans == null) {
                    // Create a record for completeness
                    AttemptAnswer empty = new AttemptAnswer();
                    empty.setAttemptId(attemptId);
                    empty.setQuestionId(qId);
                    empty.setIsCorrect(false);
                    empty.setMarksObtained(BigDecimal.ZERO);
                    empty.setMarkedForReview(false);
                    answerRepository.save(empty);
                } else {
                    ans.setIsCorrect(false);
                    ans.setMarksObtained(BigDecimal.ZERO);
                    answerRepository.save(ans);
                }
                continue;
            }

            // Determine correctness by checking the option's isCorrect flag
            // This is ONLY from the database — never from client input
            Option selectedOpt = optionRepository.findById(ans.getSelectedOptionId()).orElse(null);
            boolean isCorrect = selectedOpt != null && Boolean.TRUE.equals(selectedOpt.getIsCorrect());

            BigDecimal marksObtained;
            if (isCorrect) {
                correct++;
                marksObtained = q.getMarks();
                totalScore = totalScore.add(marksObtained);
            } else {
                wrong++;
                marksObtained = q.getNegativeMarks().negate();
                totalScore = totalScore.add(marksObtained);
            }

            ans.setIsCorrect(isCorrect);
            ans.setMarksObtained(marksObtained);
            answerRepository.save(ans);
        }

        // Ensure score doesn't go negative
        if (totalScore.compareTo(BigDecimal.ZERO) < 0) totalScore = BigDecimal.ZERO;

        // Calculate percentage and accuracy
        BigDecimal totalMarks = attempt.getTotalMarks();
        double percentage = totalMarks != null && totalMarks.compareTo(BigDecimal.ZERO) > 0
                ? totalScore.divide(totalMarks, 4, RoundingMode.HALF_UP)
                             .multiply(BigDecimal.valueOf(100))
                             .doubleValue()
                : 0;

        int totalAttempted = correct + wrong;
        double accuracy = totalAttempted > 0
                ? (double) correct / totalAttempted * 100
                : 0;

        int timeTakenSeconds = (int) ChronoUnit.SECONDS.between(
                attempt.getStartedAt(), submittedAt);

        // Finalise the attempt record
        attempt.setScore(totalScore);
        attempt.setCorrectAnswers(correct);
        attempt.setWrongAnswers(wrong);
        attempt.setUnanswered(unanswered);
        attempt.setTimeTakenSeconds(timeTakenSeconds);
        attempt.setSubmittedAt(submittedAt);
        attempt.setStatus(wasExpired ? AttemptStatus.ABANDONED : AttemptStatus.COMPLETED);
        attemptRepository.save(attempt);

        log.info("Attempt submitted: id={} userId={} score={}/{} correct={} wrong={} expired={}",
                attemptId, userId, totalScore, totalMarks, correct, wrong, wasExpired);

        return SubmitResponse.builder()
                .attemptId(attemptId)
                .score(totalScore)
                .totalMarks(totalMarks)
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .accuracy(Math.round(accuracy * 100.0) / 100.0)
                .correctAnswers(correct)
                .wrongAnswers(wrong)
                .unanswered(unanswered)
                .timeTakenSeconds(timeTakenSeconds)
                .submittedAt(submittedAt)
                .wasExpired(wasExpired)
                .build();
    }

    // ──────────────────────────────────────────────────────────────────
    // Phase 29: Get full result with per-question breakdown
    // ──────────────────────────────────────────────────────────────────

    /**
     * Returns the full result including correct answers and explanations.
     * Only available AFTER submission — never during an active attempt.
     */
    @Transactional(readOnly = true)
    public ResultResponse getResult(Long attemptId, Long userId) {

        TestAttempt attempt = findAttemptForUser(attemptId, userId);

        if (attempt.getStatus() == AttemptStatus.IN_PROGRESS)
            throw new BadRequestException(
                "Test is still in progress. Submit first to see results.");

        MockTest test = mockTestRepository.findById(attempt.getMockTestId()).orElseThrow();

        // Load all answers
        Map<Long, AttemptAnswer> answerMap = answerRepository.findByAttemptId(attemptId)
                .stream().collect(Collectors.toMap(AttemptAnswer::getQuestionId, a -> a));

        // Build per-question result list
        List<MockTestQuestion> mtqs = mtqRepository
                .findByMockTestIdOrderByQuestionOrderAsc(attempt.getMockTestId());

        List<QuestionResultDto> questionResults = new ArrayList<>();

        for (MockTestQuestion mtq : mtqs) {
            Question q = questionRepository.findById(mtq.getQuestionId()).orElse(null);
            if (q == null) continue;

            AttemptAnswer ans = answerMap.get(q.getId());

            // Load all options WITH isCorrect flag (safe to reveal after submission)
            List<Option> opts = optionRepository.findByQuestionIdOrderByOptionOrderAsc(q.getId());
            List<OptionDto> optDtos = opts.stream().map(o -> OptionDto.builder()
                    .id(o.getId())
                    .optionText(o.getOptionText())
                    .optionTextHindi(o.getOptionTextHindi())
                    .optionOrder(o.getOptionOrder())
                    .isCorrect(o.getIsCorrect()) // safe to reveal now
                    .build()).collect(Collectors.toList());

            // Find the correct option id
            Long correctOptId = opts.stream()
                    .filter(o -> Boolean.TRUE.equals(o.getIsCorrect()))
                    .map(Option::getId)
                    .findFirst().orElse(null);

            Long    selectedOptId   = ans != null ? ans.getSelectedOptionId() : null;
            boolean isCorrect       = ans != null && Boolean.TRUE.equals(ans.getIsCorrect());
            boolean wasSkipped      = selectedOptId == null;
            BigDecimal marksObtained = ans != null && ans.getMarksObtained() != null
                    ? ans.getMarksObtained() : BigDecimal.ZERO;

            questionResults.add(QuestionResultDto.builder()
                    .questionId(q.getId())
                    .questionOrder(mtq.getQuestionOrder())
                    .questionText(q.getQuestionText())
                    .questionTextHindi(q.getQuestionTextHindi())
                    .difficulty(q.getDifficulty())
                    .marks(q.getMarks())
                    .negativeMarks(q.getNegativeMarks())
                    .marksObtained(marksObtained)
                    .selectedOptionId(selectedOptId)
                    .correctOptionId(correctOptId)
                    .isCorrect(isCorrect)
                    .wasSkipped(wasSkipped)
                    .explanation(q.getExplanation())
                    .explanationHindi(q.getExplanationHindi())
                    .options(optDtos)
                    .build());
        }

        BigDecimal totalMarks = attempt.getTotalMarks();
        double percentage = totalMarks != null && totalMarks.compareTo(BigDecimal.ZERO) > 0
                ? (attempt.getScore() != null
                    ? attempt.getScore().divide(totalMarks, 4, RoundingMode.HALF_UP)
                              .multiply(BigDecimal.valueOf(100)).doubleValue()
                    : 0)
                : 0;

        int totalAttempted = attempt.getCorrectAnswers() + attempt.getWrongAnswers();
        double accuracy = totalAttempted > 0
                ? (double) attempt.getCorrectAnswers() / totalAttempted * 100
                : 0;

        return ResultResponse.builder()
                .attemptId(attemptId)
                .mockTestId(attempt.getMockTestId())
                .testTitle(test.getTitle())
                .score(attempt.getScore())
                .totalMarks(totalMarks)
                .percentage(Math.round(percentage * 100.0) / 100.0)
                .accuracy(Math.round(accuracy * 100.0) / 100.0)
                .correctAnswers(attempt.getCorrectAnswers())
                .wrongAnswers(attempt.getWrongAnswers())
                .unanswered(attempt.getUnanswered())
                .timeTakenSeconds(attempt.getTimeTakenSeconds() != null
                        ? attempt.getTimeTakenSeconds() : 0)
                .startedAt(attempt.getStartedAt())
                .submittedAt(attempt.getSubmittedAt())
                .questions(questionResults)
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
