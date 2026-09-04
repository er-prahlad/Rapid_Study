package com.rapidstudy.service;

import com.rapidstudy.dto.mocktest.AddQuestionsRequest;
import com.rapidstudy.dto.mocktest.MockTestDto;
import com.rapidstudy.dto.mocktest.MockTestRequest;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.entity.MockTest;
import com.rapidstudy.entity.MockTestQuestion;
import com.rapidstudy.entity.Question;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ConflictException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
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
    }

    public MockTestDto toDto(MockTest t) {
        String examName = (t.getExam() != null) ? t.getExam().getName() : null;
        if (examName == null) {
            examName = examRepository.findById(t.getExamId())
                    .map(e -> e.getName()).orElse(null);
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
                .createdAt(t.getCreatedAt()).updatedAt(t.getUpdatedAt())
                .build();
    }

    private String nullIfBlank(String s) {
        return (s == null || s.isBlank()) ? null : s.trim();
    }
}
