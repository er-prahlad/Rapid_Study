package com.rapidstudy.controller;

import com.rapidstudy.dto.ApiResponse;
import com.rapidstudy.dto.mocktest.MockTestDto;
import com.rapidstudy.dto.question.QuestionSafeDto;
import com.rapidstudy.repository.MockTestRepository;
import com.rapidstudy.service.MockTestService;
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
 * Student-facing mock test endpoints.
 *
 * GET /api/v1/tests                — published tests (Phase 21)
 * GET /api/v1/tests/{id}           — test details (Phase 22)
 * GET /api/v1/tests/{id}/questions — safe questions (Phase 23 — no answers)
 */
@RestController
@RequestMapping("/api/v1/tests")
@RequiredArgsConstructor
@Tag(name = "Tests", description = "Student mock test listing and instructions")
public class MockTestController {

    private final MockTestService    mockTestService;
    private final MockTestRepository mockTestRepository;

    @GetMapping
    @Operation(summary = "List all published mock tests with optional exam filter")
    public ResponseEntity<ApiResponse<Page<MockTestDto>>> listTests(
            @RequestParam(required = false) Long   examId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "12") int size) {

        Page<MockTestDto> result = mockTestService.getPublishedTests(
                examId, search,
                PageRequest.of(page, Math.min(size, 50), Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.success("Tests retrieved", result));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a single published test (for instructions page)")
    public ResponseEntity<ApiResponse<MockTestDto>> getTest(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Test retrieved", mockTestService.getPublishedById(id)));
    }

    @GetMapping("/{id}/questions")
    @Operation(summary = "Get questions for a test (safe — no correct answers)")
    public ResponseEntity<ApiResponse<List<QuestionSafeDto>>> getTestQuestions(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success("Questions retrieved", mockTestService.getTestQuestions(id)));
    }

    @GetMapping("/previous-year")
    @Operation(summary = "Get previous year papers — filter by examId and/or year")
    public ResponseEntity<ApiResponse<Page<MockTestDto>>> getPreviousYearPapers(
            @RequestParam(required = false) Long   examId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        Page<MockTestDto> result = examId != null
                ? mockTestService.getPublishedTests(examId, null,
                        PageRequest.of(page, size))
                : mockTestService.getPublishedTests(null, null,
                        PageRequest.of(page, size));
        // Filter to PREVIOUS_YEAR type
        Page<MockTestDto> filtered = mockTestRepository.findByIsPublishedTrueAndPaperType(
                "PREVIOUS_YEAR", PageRequest.of(page, size)).map(mockTestService::toDto);
        return ResponseEntity.ok(ApiResponse.success("Previous year papers retrieved", filtered));
    }
}
