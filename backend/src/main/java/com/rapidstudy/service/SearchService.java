package com.rapidstudy.service;

import com.rapidstudy.dto.exam.ExamDto;
import com.rapidstudy.dto.mocktest.MockTestDto;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Phase 44: Unified search service.
 *
 * Currently backed by MySQL LIKE queries.
 * Designed so the implementation can be swapped for Elasticsearch/OpenSearch
 * by replacing this service bean — the controller and DTOs don't change.
 *
 * To migrate to Elasticsearch: implement SearchServiceEsImpl and qualify with @Primary.
 */
@Service
@RequiredArgsConstructor
public class SearchService {

    private final ExamRepository     examRepository;
    private final MockTestRepository mockTestRepository;
    private final QuestionRepository questionRepository;
    private final TopicRepository    topicRepository;
    private final ExamService        examService;
    private final MockTestService    mockTestService;
    private final QuestionService    questionService;

    @Transactional(readOnly = true)
    public SearchResult search(String query, int size) {
        if (query == null || query.isBlank()) return SearchResult.empty();

        String q = query.trim();

        // Exams
        List<ExamDto> exams = examRepository
                .searchActive(q, PageRequest.of(0, Math.min(size, 5)))
                .stream().map(examService::toDto).collect(Collectors.toList());

        // Tests
        List<MockTestDto> tests = mockTestRepository
                .findPublishedFiltered(null, q, PageRequest.of(0, Math.min(size, 5)))
                .stream().map(mockTestService::toDto).collect(Collectors.toList());

        // Questions (safe — no correct answers)
        List<QuestionSafeDto> questions = questionRepository
                .findFiltered(null, null, null, true, q, PageRequest.of(0, Math.min(size, 5)))
                .stream().map(questionService::toSafeDto).collect(Collectors.toList());

        // Topics
        List<TopicResult> topics = topicRepository.searchByName(q, PageRequest.of(0, Math.min(size, 5)))
                .stream().map(t -> new TopicResult(t.getId(), t.getName(),
                        t.getSubject() != null ? t.getSubject().getName() : null))
                .collect(Collectors.toList());

        return SearchResult.builder()
                .query(q)
                .exams(exams).tests(tests).questions(questions).topics(topics)
                .build();
    }

    // ── Result types ─────────────────────────────────────────────────────

    @lombok.Data @lombok.Builder @lombok.NoArgsConstructor @lombok.AllArgsConstructor
    public static class SearchResult {
        private String             query;
        private List<ExamDto>          exams;
        private List<MockTestDto>      tests;
        private List<QuestionSafeDto>  questions;
        private List<TopicResult>      topics;

        static SearchResult empty() {
            return SearchResult.builder()
                    .query("").exams(List.of()).tests(List.of())
                    .questions(List.of()).topics(List.of()).build();
        }
    }

    @lombok.Data @lombok.AllArgsConstructor
    public static class TopicResult {
        private Long   id;
        private String name;
        private String subjectName;
    }
}
