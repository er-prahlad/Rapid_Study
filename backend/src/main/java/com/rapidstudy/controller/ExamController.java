package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.exam.*;
import com.rapidstudy.service.ExamService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Student-facing exam endpoints.
 * These are publicly readable (permitAll in SecurityConfig).
 *
 * GET /api/v1/exams                    — paginated exam list + search
 * GET /api/v1/exams/{id}               — exam detail with subjects/topics
 * GET /api/v1/exams/{id}/subjects      — subjects for exam
 * GET /api/v1/exams/{id}/tests         — published mock tests for exam
 */
@RestController
@RequestMapping("/api/v1/exams")
@RequiredArgsConstructor
@Tag(name = "Exams", description = "Exam listing and details")
public class ExamController {

    private final ExamService examService;

    @GetMapping
    @Operation(summary = "List active exams with optional search")
    public ResponseEntity<ApiResponse<Page<ExamDto>>> listExams(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<ExamDto> result = examService.getActiveExams(
                search,
                PageRequest.of(page, Math.min(size, 50), Sort.by("name")));
        return ResponseEntity.ok(ApiResponse.success("Exams retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get exam details with subjects and topics")
    public ResponseEntity<ApiResponse<ExamDetailDto>> getExam(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Exam retrieved", examService.getExamDetail(id)));
    }

    @GetMapping("/{id}/subjects")
    @Operation(summary = "Get subjects for an exam")
    public ResponseEntity<ApiResponse<List<SubjectDto>>> getSubjects(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Subjects retrieved", examService.getSubjects(id)));
    }

    @GetMapping("/{id}/tests")
    @Operation(summary = "Get published mock tests for an exam")
    public ResponseEntity<ApiResponse<Page<MockTestSummaryDto>>> getTests(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "10") int size) {

        Page<MockTestSummaryDto> result = examService.getExamTests(
                id, PageRequest.of(page, Math.min(size, 50)));
        return ResponseEntity.ok(ApiResponse.success("Tests retrieved", result));
    }
}
