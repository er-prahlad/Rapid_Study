package com.rapidstudy.service;

import com.rapidstudy.dto.exam.*;
import com.rapidstudy.entity.Exam;
import com.rapidstudy.entity.Subject;
import com.rapidstudy.entity.Topic;
import com.rapidstudy.exception.BadRequestException;
import com.rapidstudy.exception.ConflictException;
import com.rapidstudy.exception.ResourceNotFoundException;
import com.rapidstudy.repository.ExamRepository;
import com.rapidstudy.repository.MockTestRepository;
import com.rapidstudy.repository.SubjectRepository;
import com.rapidstudy.repository.TopicRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Exam service — handles both student read access and admin CRUD.
 *
 * Route security is enforced at the controller level via @PreAuthorize.
 * This service is role-agnostic; controllers decide what to expose.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ExamService {

    private final ExamRepository    examRepository;
    private final SubjectRepository subjectRepository;
    private final TopicRepository   topicRepository;
    private final MockTestRepository mockTestRepository;

    // ─────────────────────────────────────────────────────────────────
    // Student read operations (public / authenticated)
    // ─────────────────────────────────────────────────────────────────

    /** Paginated list of active exams with optional keyword search */
    @Transactional(readOnly = true)
    public Page<ExamDto> getActiveExams(String query, Pageable pageable) {
        Page<Exam> page = (query == null || query.isBlank())
                ? examRepository.findByIsActiveTrueOrderByNameAsc(pageable)
                : examRepository.searchActive(query.trim(), pageable);
        return page.map(this::toDto);
    }

    /** Full exam detail with subjects + topics */
    @Transactional(readOnly = true)
    public ExamDetailDto getExamDetail(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + id));

        List<SubjectDto> subjects = subjectRepository
                .findByExamIdOrderByDisplayOrderAsc(id)
                .stream()
                .map(s -> {
                    List<TopicDto> topics = topicRepository
                            .findBySubjectIdOrderByDisplayOrderAsc(s.getId())
                            .stream().map(this::toTopicDto).collect(Collectors.toList());
                    return toSubjectDto(s, topics);
                })
                .collect(Collectors.toList());

        long totalTests = mockTestRepository
                .findByExamIdAndIsPublishedTrue(id, PageRequest.of(0, 1)).getTotalElements();

        return ExamDetailDto.builder()
                .id(exam.getId())
                .name(exam.getName())
                .code(exam.getCode())
                .description(exam.getDescription())
                .logo(exam.getLogo())
                .isActive(exam.getIsActive())
                .totalSubjects(subjects.size())
                .totalTests((int) totalTests)
                .createdAt(exam.getCreatedAt())
                .subjects(subjects)
                .build();
    }

    /** Subjects for an exam (flat list with topics) */
    @Transactional(readOnly = true)
    public List<SubjectDto> getSubjects(Long examId) {
        examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + examId));
        return subjectRepository.findByExamIdOrderByDisplayOrderAsc(examId)
                .stream()
                .map(s -> {
                    List<TopicDto> topics = topicRepository
                            .findBySubjectIdOrderByDisplayOrderAsc(s.getId())
                            .stream().map(this::toTopicDto).collect(Collectors.toList());
                    return toSubjectDto(s, topics);
                })
                .collect(Collectors.toList());
    }

    /** Published mock tests for an exam */
    @Transactional(readOnly = true)
    public Page<MockTestSummaryDto> getExamTests(Long examId, Pageable pageable) {
        examRepository.findById(examId)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + examId));
        return mockTestRepository.findByExamIdAndIsPublishedTrue(examId, pageable)
                .map(t -> MockTestSummaryDto.builder()
                        .id(t.getId())
                        .examId(t.getExamId())
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .durationMinutes(t.getDurationMinutes())
                        .totalQuestions(t.getTotalQuestions())
                        .totalMarks(t.getTotalMarks())
                        .negativeMarks(t.getNegativeMarks())
                        .isPublished(t.getIsPublished())
                        .build());
    }

    // ─────────────────────────────────────────────────────────────────
    // Admin CRUD — Exam
    // ─────────────────────────────────────────────────────────────────

    /** Admin: paginated list with optional search, all statuses */
    @Transactional(readOnly = true)
    public Page<ExamDto> adminListExams(String query, Pageable pageable) {
        return examRepository.findAllWithSearch(
                (query == null || query.isBlank()) ? null : query.trim(), pageable)
                .map(this::toDto);
    }

    @Transactional
    public ExamDto createExam(ExamRequest req) {
        if (examRepository.existsByCode(req.getCode())) {
            throw new ConflictException("Exam code already exists: " + req.getCode());
        }
        Exam exam = new Exam();
        applyExamRequest(exam, req);
        Exam saved = examRepository.save(exam);
        log.info("Admin created exam: id={} code={}", saved.getId(), saved.getCode());
        return toDto(saved);
    }

    @Transactional
    public ExamDto updateExam(Long id, ExamRequest req) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + id));
        if (examRepository.existsByCodeAndIdNot(req.getCode(), id)) {
            throw new ConflictException("Exam code already used: " + req.getCode());
        }
        applyExamRequest(exam, req);
        return toDto(examRepository.save(exam));
    }

    @Transactional
    public void deactivateExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + id));
        exam.setIsActive(false);
        examRepository.save(exam);
        log.info("Admin deactivated exam: id={}", id);
    }

    @Transactional
    public void activateExam(Long id) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + id));
        exam.setIsActive(true);
        examRepository.save(exam);
    }

    // ─────────────────────────────────────────────────────────────────
    // Admin CRUD — Subject
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public SubjectDto createSubject(SubjectRequest req) {
        examRepository.findById(req.getExamId())
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found: " + req.getExamId()));
        if (subjectRepository.existsByNameAndExamId(req.getName(), req.getExamId())) {
            throw new ConflictException("Subject '" + req.getName() + "' already exists for this exam");
        }
        Subject s = new Subject();
        s.setExamId(req.getExamId());
        s.setName(req.getName());
        s.setDescription(req.getDescription());
        s.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
        return toSubjectDto(subjectRepository.save(s), null);
    }

    @Transactional
    public SubjectDto updateSubject(Long id, SubjectRequest req) {
        Subject s = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + id));
        if (subjectRepository.existsByNameAndExamIdAndIdNot(req.getName(), s.getExamId(), id)) {
            throw new ConflictException("Subject name already exists: " + req.getName());
        }
        s.setName(req.getName());
        s.setDescription(req.getDescription());
        if (req.getDisplayOrder() != null) s.setDisplayOrder(req.getDisplayOrder());
        return toSubjectDto(subjectRepository.save(s), null);
    }

    @Transactional
    public void deleteSubject(Long id) {
        Subject s = subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + id));
        topicRepository.deleteBySubjectId(id);
        subjectRepository.delete(s);
        log.info("Admin deleted subject: id={}", id);
    }

    // ─────────────────────────────────────────────────────────────────
    // Admin CRUD — Topic
    // ─────────────────────────────────────────────────────────────────

    @Transactional
    public TopicDto createTopic(TopicRequest req) {
        subjectRepository.findById(req.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found: " + req.getSubjectId()));
        if (topicRepository.existsByNameAndSubjectId(req.getName(), req.getSubjectId())) {
            throw new ConflictException("Topic '" + req.getName() + "' already exists for this subject");
        }
        Topic t = new Topic();
        t.setSubjectId(req.getSubjectId());
        t.setName(req.getName());
        t.setDescription(req.getDescription());
        t.setDisplayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0);
        return toTopicDto(topicRepository.save(t));
    }

    @Transactional
    public TopicDto updateTopic(Long id, TopicRequest req) {
        Topic t = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + id));
        if (topicRepository.existsByNameAndSubjectIdAndIdNot(req.getName(), t.getSubjectId(), id)) {
            throw new ConflictException("Topic name already exists: " + req.getName());
        }
        t.setName(req.getName());
        t.setDescription(req.getDescription());
        if (req.getDisplayOrder() != null) t.setDisplayOrder(req.getDisplayOrder());
        return toTopicDto(topicRepository.save(t));
    }

    @Transactional
    public void deleteTopic(Long id) {
        Topic t = topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found: " + id));
        topicRepository.delete(t);
    }

    // ─────────────────────────────────────────────────────────────────
    // Mappers
    // ─────────────────────────────────────────────────────────────────

    private void applyExamRequest(Exam exam, ExamRequest req) {
        exam.setName(req.getName());
        exam.setCode(req.getCode().toUpperCase());
        exam.setDescription(req.getDescription());
        exam.setLogo(req.getLogo());
        exam.setIsActive(req.getIsActive() != null ? req.getIsActive() : true);
    }

    public ExamDto toDto(Exam e) {
        return ExamDto.builder()
                .id(e.getId())
                .name(e.getName())
                .code(e.getCode())
                .description(e.getDescription())
                .logo(e.getLogo())
                .isActive(e.getIsActive())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .build();
    }

    public SubjectDto toSubjectDto(Subject s, List<TopicDto> topics) {
        return SubjectDto.builder()
                .id(s.getId())
                .examId(s.getExamId())
                .name(s.getName())
                .description(s.getDescription())
                .displayOrder(s.getDisplayOrder())
                .topics(topics)
                .build();
    }

    public TopicDto toTopicDto(Topic t) {
        return TopicDto.builder()
                .id(t.getId())
                .subjectId(t.getSubjectId())
                .name(t.getName())
                .description(t.getDescription())
                .displayOrder(t.getDisplayOrder())
                .build();
    }
}
